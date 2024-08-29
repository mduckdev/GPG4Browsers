import { RootState, useAppSelector } from "@src/redux/store";
import {  DecryptMessageResult, Key, KeyID, Message, PrivateKey, Subkey, decrypt, readKey, readMessage, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "@src/components/modals/PassphraseModal";

import OutputTextarea from "@src/components/OutputTextarea";
import { CryptoKeys, MainProps, decryptedFile, file } from "@src/types";
import { convertUint8ToUrl, formatBytes, getPrivateKeysAndPasswords, getSignatureInfo, handleDataLoaded, handleDataLoadedOnDrop } from "@src/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import ShowFilesInTable from "@src/components/ShowFilesInTable";
import { useTranslation } from "react-i18next";
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

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [isMessageVerified,setIsMessageVerified] = useState<boolean>(false);
    const [decryptionInProgress,setDecryptionInProgress] = useState<boolean>(false);



    const findDecryptionKeyInKeyring = async (encryptionKeys:KeyID[]) =>{
        for(const privateKey of privKeysList){
            const privKey:PrivateKey|null = await readPrivateKey({armoredKey:privateKey.keyValue}).catch(e => { console.error(e); return null });
            if(!privKey){
                return;
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
        const decryptionKeysNeeded:CryptoKeys[] = [];
        let parsedFiles:Message<Uint8Array>[]=[];
        for await(const currentFile of encryptedFiles){
            const pgpMessage:Message<Uint8Array>|null = await readMessage({binaryMessage:currentFile.data}).catch(e => { console.error(e); return null });
            if(!pgpMessage ){
                // setDecryptionInProgress(false);
                continue;
                //show alert with information
            }
            const messageEncryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
            if(messageEncryptionKeys.length===0){
                decryptionKeysNeeded.push({data:currentFile.data,isPrivateKey:false,isUnlocked:false,filename:currentFile.fileName})
            }else{
                let messageDecryptionKey = await findDecryptionKeyInKeyring(messageEncryptionKeys);

                if(!messageDecryptionKey){
                    console.log(`Couldn't find a suitable key with IDs:${messageEncryptionKeys.map(e=>e.toHex()).join(" ")}`)            
                    continue;
                    //show alert no key found
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
        const pgpMessage:Message<string>|null = await readMessage({armoredMessage:encryptedMessage}).catch(e => { console.error(e); return null });
        if(pgpMessage){
            const messageEncryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
            if(messageEncryptionKeys.length===0){
                decryptionKeysNeeded.push({data:encryptedMessage,isPrivateKey:false,isUnlocked:false})
            }else{
                const messageDecryptionKey = await findDecryptionKeyInKeyring(messageEncryptionKeys);
                if(!messageDecryptionKey){
                    console.log(`Couldn't find a suitable key with IDs:${messageEncryptionKeys.map(e=>e.toHex()).join(" ")}`)            
                    // return;
                    //show alert no key found
                }
                if(messageDecryptionKey && 
                    decryptionKeysNeeded.filter(e=>e.data===messageDecryptionKey).length===0
                ){
                    decryptionKeysNeeded.push({data:messageDecryptionKey,isPrivateKey:true,isUnlocked:false});
                }
            }
            
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
        if(encryptedMessage===""){
            return;
        }
        const {privateKeys,passwords} = await getPrivateKeysAndPasswords(decryptionKeys);
        let cfg;
        if(passwords.length===0){
            cfg={message:pgpMessage,decryptionKeys:privateKeys,verificationKeys:publicKeys} // if passwords are specified but encrypted message wasn't encrypted with password, decrypt() throws error
        }else{
            cfg={message:pgpMessage,decryptionKeys:privateKeys,passwords:passwords,verificationKeys:publicKeys};
        }
        const decryptedMessage:DecryptMessageResult|null = await decrypt(cfg).catch(e => { console.error(e); return null });

        if(!decryptedMessage){
            console.log("Failed to decrypt the message.");
            return;
        }


        const results = await getSignatureInfo(decryptedMessage.signatures).catch(e=>{console.error(e);return null});

        if(!results){
            setSignatureMessages("Message authenticity could not be verified.");
            setIsMessageVerified(false);
            return;
        }

        setIsMessageVerified(true)
        setSignatureMessages(results.join("\n"))
        setDecryptedMessage(decryptedMessage.data.toString());
    }
    const decryptFiles = async (decryptionKeys:CryptoKeys[],publicKeys:Key[])=>{
        if(encryptedFiles.length===0 || !encryptedFiles[0]){
            return;
        }
        const newDecryptedFiles:decryptedFile[] = [];
        setDecryptionInProgress(true);
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
                continue;
            }

            let results = await getSignatureInfo(decryptedMessage.signatures).catch(e=>{console.error(e);return null});
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

        setDecryptionInProgress(false);
        setDecryptedFiles(newDecryptedFiles);
    }

    return (
        <div className="p-6">
            <PassphraseModal title={t("passphrase")}text={t("enterPassphrase")} isVisible={isModalVisible} setIsVisible={setIsModalVisible} dataToUnlock={decryptionKeys} onConfirm={decryptData} onClose={()=>{}} />

            <div className="w-full flex flex-col">
                <label htmlFor="message" className="block text-sm font-medium">{t("encryptedMessage")}:</label>
                <textarea id="message"
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

        </div>
    );
}