import { RootState, useAppSelector } from "@src/redux/store";
import {  DecryptMessageResult, Key, KeyID, Message, PrivateKey, Subkey, decrypt, readKey, readMessage, readPrivateKey } from "openpgp";
import React, { useEffect, useState } from "react";
import PassphraseModal from "@src/components/modals/PassphraseModal";

import OutputTextarea from "@src/components/OutputTextarea";
import { CryptoKeys, MainProps, alert, decryptedFile, file } from "@src/types";
import {  getPrivateKeysAndPasswords, getSignatureInfo, handleDataLoaded, handleDataLoadedOnDrop, merge } from "@src/utils";
import ShowFilesInTable from "@src/components/ShowFilesInTable";
import { useTranslation } from "react-i18next";
import Browser from "webextension-polyfill";
import Alert from "@src/components/Alert";
export default function Decryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);

    const [decryptionKeys,setDecryptionKeys] = useState<CryptoKeys[]>([]);
    
    const [encryptedMessage,setEncryptedMessage] = useState<string>("");
    const [decryptedMessage,setDecryptedMessage] = useState<string>("");
    const [signatureMessages,setSignatureMessages] = useState<string>("");

    const [encryptedFiles, setEncryptedFiles] = useState<file[]>([])
    const [decryptedFiles, setDecryptedFiles] = useState<decryptedFile[]>([])
    const [alerts,setAlerts] = useState<alert[]>([]);

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [isMessageVerified,setIsMessageVerified] = useState<boolean>(false);
    const [decryptionInProgress,setDecryptionInProgress] = useState<boolean>(false);

    const attempToDecrypt = async (message:string)=>{
        const messageParsed = await readMessage({armoredMessage:message}).catch(e=>{return null});
        if(messageParsed){
            decryptData();
        }
    }
    const getData = async (id:string)=>{
        const data = await Browser.runtime.sendMessage({action:"get-data-by-id",id:id});
        if(typeof data === "string"){
            setEncryptedMessage(data);
        }
    }
    useEffect(()=>{
        const params = new URLSearchParams(window.location.search);
        let id = params.get("id")
        if(params.get("waitForData")==="true" && id){
            getData(id);
        }
    },[]);
    useEffect(()=>{
        attempToDecrypt(encryptedMessage);
    },[encryptedMessage]);
    

    
    const findDecryptionKeyInKeyring = async (encryptionKeys:KeyID[]) =>{
        for(const privateKey of privKeysList){
            const privKey:PrivateKey|null = await readPrivateKey({armoredKey:privateKey.keyValue}).catch(e => { console.error(e); return null });
            if(!privKey){
                continue;
            }
            // see https://github.com/openpgpjs/openpgpjs/issues/1693
            //
            //@ts-ignore
            const privKeyDecryptionKeys:(Key | Subkey)[] = await privKey.getDecryptionKeys()

            for(const privKeyDecryptionKey of privKeyDecryptionKeys){
                const decryptionKeyID = privKeyDecryptionKey.getKeyID();
                for(const encryptionKey of encryptionKeys){
                    if(decryptionKeyID.equals(encryptionKey)){
                        return privKey.armor();
                    }
                }
            }
        }
        return false;
    }


    const decryptData = async (decryptionData?:CryptoKeys[])=>{
        if(encryptedMessage.length===0 && encryptedFiles.length === 0){
            setAlerts([
                ...alerts,
                {
                  text:t("selectFilesOrEnterMessage"),
                  style:"alert-error"
                }
            ]);
            return;
        }
        const decryptionKeysNeeded:CryptoKeys[] = [];
        let parsedFiles:Message<Uint8Array>[]=[];
        let notFoundKeyIDs:string[]=[];
        for await(const currentFile of encryptedFiles){
            const pgpMessage:Message<Uint8Array>|null = await readMessage({binaryMessage:currentFile.data}).catch(e => { console.error(e); return null });
            if(!pgpMessage ){
                setAlerts([
                    ...alerts,
                    {
                      text:`${t("failedToParseTheFile")}: ${currentFile.fileName}`,
                      style:"alert-error"
                    }
                ]);
                continue;
            }
            const messageEncryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
            if(messageEncryptionKeys.length===0){
                decryptionKeysNeeded.push({data:currentFile.data,isPrivateKey:false,isUnlocked:false,filename:currentFile.fileName})
            }else{
                let messageDecryptionKey = await findDecryptionKeyInKeyring(messageEncryptionKeys);

                if(!messageDecryptionKey){
                    notFoundKeyIDs = merge(notFoundKeyIDs,messageEncryptionKeys.map(e=>e.toHex()));
                    
                    continue;
                }
                const isKeyUnlocked =  (await readPrivateKey({armoredKey:messageDecryptionKey})).isDecrypted();
                if(messageDecryptionKey && 
                    decryptionKeysNeeded.filter(e=>e.data===messageDecryptionKey).length===0
                ){
                    decryptionKeysNeeded.push({data:messageDecryptionKey,isPrivateKey:true,isUnlocked:isKeyUnlocked});
                }
            }
            
            parsedFiles.push(pgpMessage);
            
        }
        if(notFoundKeyIDs.length>0){
            setAlerts([
                ...alerts,
                {
                  text:`${t("noDecryptionKeyFound")}: ${notFoundKeyIDs.join(", ")}`,
                  style:"alert-error"
                }
            ]);
        }
        const pgpMessage:Message<string>|null = await readMessage({armoredMessage:encryptedMessage}).catch(e => { console.error(e); return null });
        if(pgpMessage){
            const messageEncryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
            if(messageEncryptionKeys.length===0){ //password
                decryptionKeysNeeded.push({data:encryptedMessage,isPrivateKey:false,isUnlocked:false})
            }else{
                const messageDecryptionKey = await findDecryptionKeyInKeyring(messageEncryptionKeys);
                if(!messageDecryptionKey){
                    setAlerts([
                        ...alerts,
                        {
                          text:`${t("noDecryptionKeyFound")}: ${messageEncryptionKeys.map(e=>e.toHex()).join(" ")}`,
                          style:"alert-error"
                        }
                    ]);
                }
                if(messageDecryptionKey && 
                    decryptionKeysNeeded.filter(e=>e.data===messageDecryptionKey).length===0
                ){
                    const messageDecryptionKeyParsed = await readPrivateKey({armoredKey:messageDecryptionKey}).catch(e => { console.error(e); return null });
                    if(messageDecryptionKeyParsed){
                        decryptionKeysNeeded.push({data:messageDecryptionKey,isPrivateKey:true,isUnlocked:messageDecryptionKeyParsed.isDecrypted()});
                    }
                }
            }
            
        }
        if(!pgpMessage && encryptedFiles.length===0){
            setAlerts([
                ...alerts,
                {
                  text:t("selectFilesOrEnterMessage"),
                  style:"alert-error"
                }
            ]);
            return;
        }

        setDecryptionKeys(decryptionKeysNeeded);
        if(decryptionKeysNeeded.length === 0){
            return;
        };

        let parsedDecryptionData:CryptoKeys[]=[];
        if(!decryptionData || decryptionData.length===0){
            const areAllPrivateKeysDecrypted = decryptionKeysNeeded.every((e) => e.isUnlocked);
            if(!areAllPrivateKeysDecrypted){
                    setIsModalVisible(true);
                    return;
            }else{
                parsedDecryptionData = decryptionKeysNeeded;
            }
        }else{
            parsedDecryptionData=decryptionData;
        }
        const parsedPublicKeys = await Promise.all(pubKeysList.map(async e=>await readKey({armoredKey:e.keyValue})))

        

        if(pgpMessage){
            decryptMessage(pgpMessage,parsedDecryptionData,parsedPublicKeys)
        }
        if(encryptedFiles.length>0){
            decryptFiles(parsedDecryptionData,parsedPublicKeys)
        }
    }

    const decryptMessage = async (pgpMessage:Message<string>,decryptionKeys:CryptoKeys[],publicKeys:Key[])=>{
        const {privateKeys,passwords} = await getPrivateKeysAndPasswords(decryptionKeys);
        let cfg;
        if(passwords.length===0){
            cfg={message:pgpMessage,decryptionKeys:privateKeys,verificationKeys:publicKeys} // if passwords are specified but encrypted message wasn't encrypted with password, decrypt() throws error
        }else{
            cfg={message:pgpMessage,decryptionKeys:privateKeys,passwords:passwords,verificationKeys:publicKeys};
        }
        const decryptedMessage:DecryptMessageResult|null = await decrypt(cfg).catch(e => { console.error(e); return null });

        if(!decryptedMessage){
            setAlerts([
                ...alerts,
                {
                  text:t("failedToDecryptMessage"),
                  style:"alert-error"
                }
            ]);
            return;
        }


        const results = await getSignatureInfo(decryptedMessage.signatures,publicKeys,t).catch(e=>{console.error(e);return null});

        setIsMessageVerified(results?true:false)
        setSignatureMessages(results?results.join("\n"):t("messageUnathenticated"))
        setDecryptedMessage(decryptedMessage.data.toString());
    }
    const decryptFiles = async (decryptionKeys:CryptoKeys[],publicKeys:Key[])=>{
        if(encryptedFiles.length===0 || !encryptedFiles[0]){
            return;
        }
        const newDecryptedFiles:decryptedFile[] = [];
        setDecryptionInProgress(true);
        let notDecryptedFilenames:string[]=[];
        for await(const currentFile of encryptedFiles){
            const pgpMessage:Message<Uint8Array>|null = await readMessage({binaryMessage:currentFile.data}).catch(e => { console.error(e);return null}); 
            if(!pgpMessage ){
                continue;
            }
            const {privateKeys,passwords} = await getPrivateKeysAndPasswords(decryptionKeys);

            let cfg;
            if(passwords.length===0){
                cfg={message:pgpMessage,decryptionKeys:privateKeys,verificationKeys:publicKeys} // if passwords are specified but encrypted message wasn't encrypted with password, decrypt() throws error
            }else{
                cfg={message:pgpMessage,decryptionKeys:privateKeys,passwords:passwords,verificationKeys:publicKeys};
            }
            const decryptedMessage:DecryptMessageResult|null = await decrypt({...cfg,...{format:"binary"}}).catch(e => { console.error(e); return null });

            if(!decryptedMessage){
                console.log(`Failed to decrypt file ${currentFile.fileName}.`);
                notDecryptedFilenames = merge(notDecryptedFilenames,[currentFile.fileName])
                
                continue;
            }

            let results = await getSignatureInfo(decryptedMessage.signatures,publicKeys,t).catch(e=>{console.error(e);return null});
            let verified:boolean;
            
            if(!results){
                results=[t("messageUnathenticated")];
                verified=false;
            }else{
                verified=true;
            }
            const newDecryptedFile:decryptedFile = {
                data:decryptedMessage.data as Uint8Array,
                fileName:currentFile.fileName,
                signatureMessages:results,
                signatureStatus:verified?"text-info":"text-error"
            } 
            newDecryptedFiles.push(newDecryptedFile);
        }

        if(notDecryptedFilenames.length>0){
            setAlerts([
                ...alerts,
                {
                  text:`${t("failedToDecryptFile")}: ${notDecryptedFilenames.join(", ")}`,
                  style:"alert-error"
                }
            ]);
        }
        setDecryptionInProgress(false);
        setDecryptedFiles(newDecryptedFiles);
    }

    return (
        <div className="p-6" id="decryption">
            <PassphraseModal title={t("passphrase")}text={t("enterPassphrase")} isVisible={isModalVisible} setIsVisible={setIsModalVisible} dataToUnlock={decryptionKeys} onConfirm={decryptData} onClose={()=>{}} />

            <div className="w-full flex flex-col">
                <label htmlFor="encryptedMessage" className="block text-sm font-medium">{t("encryptedMessage")}:</label>
                <textarea id="encryptedMessage"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={encryptedMessage} onChange={(e)=>{setEncryptedMessage(e.target.value)}}></textarea>
 {
                    isPopup?(null):(
                        <div className="flex w-full flex-col border-opacity-50">
                            <div className="divider">{t("or")}</div>
                                <input 
                                className="file-input file-input-bordered w-full max-w-xs file-input-info"
                                draggable={true} type="file" multiple={true}
                                onChange={(e)=>setEncryptedFiles(handleDataLoaded(e) || [])}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const files = Array.from(e.dataTransfer.files);
                                    setEncryptedFiles(handleDataLoadedOnDrop(files) || []);
                                }}
                                />
                        </div>
                    )
                }
                <button 
                    className="mt-4 btn btn-info" onClick={()=>{decryptData()}}>{t("decrypt")}</button>
            </div>
        <p className={isMessageVerified?("text-info"):("text-error")}>{signatureMessages}</p>
        {
            (decryptedMessage === "") ? (
                null
            ) : (
            <OutputTextarea textValue={decryptedMessage}/>
            
            )
        }
        {
            decryptionInProgress?(
                <button className="btn btn-square">
                    <span className="loading loading-spinner"></span>
                </button>
            ):(null)
        }
        {
            (decryptedFiles.length !== 0 && !decryptionInProgress) ? (
                <ShowFilesInTable files={decryptedFiles} removeExtensions={true}/>
            ) : (null)
        }
        <Alert alerts={alerts} setAlerts={setAlerts} />

        </div>
    );
}