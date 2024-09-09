import { RootState, useAppSelector } from "@src/redux/store";
import { Key, MaybeArray, Message, PrivateKey, createMessage, encrypt, readKey, readPrivateKey } from "openpgp";
import React, { useEffect, useState } from "react";
import PassphraseModal from "@src/components/modals/PassphraseModal";
import OutputTextarea from "@src/components/OutputTextarea";
import KeyDropdown from "@src/components/keyDropdown";
import { CryptoKeys, MainProps, file } from "@src/types";
import {  getPrivateKey, handleDataLoaded, handleDataLoadedOnDrop, privateKeysToCryptoKeys, updateIsKeyUnlocked } from "@src/utils";
import PassphraseTextInput from "@src/components/PassphraseTextInput";
import ShowGPGFiles from "@src/components/ShowGPGFiles";
import { useTranslation } from "react-i18next";
import Browser from "webextension-polyfill";
import { IPublicKey } from "@src/redux/publicKeySlice";
import { IPrivateKey } from "@src/redux/privateKeySlice";

export default function Encryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();

    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const preferences = useAppSelector((state:RootState)=>state.preferences);


    const [selectedPubKeys,setSelectedPubKeys] =  useState<IPublicKey[]>([pubKeysList[0]] || []);
    const [selectedPrivKeys,setSelectedPrivKeys] =  useState<IPrivateKey[]>(getPrivateKey(privKeysList,preferences) || []);
    const [dataToUnlock,setDataToUnlock] = useState<CryptoKeys[]>(privateKeysToCryptoKeys(getPrivateKey(privKeysList,preferences)));

    const [message,setMessage] =  useState<string>("");
    const [password,setPassword] =  useState<string>("");

    const [encryptedMessage,setEncryptedMessage] =  useState<string>("");


    const [files,setFiles] = useState<file[]>([])
    const [encryptedFiles, setEncryptedFiles] = useState<file[]>([])

    const [signMessage,setSignMessage] = useState<boolean>(true);
    const [usePassword,setUsePassword] = useState<boolean>(false);

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);

    const [encryptionInProgress,setEncryptionInProgress] = useState<boolean>(false);
    const getData = async ()=>{
        const data = await Browser.runtime.sendMessage({action:"get-data"});
        if(typeof data === "string"){
            setMessage(data);
        }
    }

    useEffect(()=>{
        setPassword("");
        if(usePassword){
            setSelectedPubKeys([]);
        }else{
            setSelectedPubKeys([pubKeysList[0]] || []);
        }
    },[usePassword])

    
    useEffect(()=>{
        setDataToUnlock(privateKeysToCryptoKeys(selectedPrivKeys))
    },[selectedPrivKeys])

    useEffect(()=>{
        const params = new URLSearchParams(window.location.search);
        if(params.get("waitForData")==="true"){
            getData();
        }
    },[])

    const encryptData = async (privateKey:CryptoKeys[])=>{
        console.log(privateKey)
        if(selectedPubKeys?.length===0 && password===""){
            return;
        }
        const pgpKeys:Key[] = [];
        if(selectedPubKeys){
            for await(const pubkey of selectedPubKeys){
                let key = await readKey({armoredKey:pubkey.keyValue}).catch(e => { console.error(e); return null })
                if(key){
                    pgpKeys.push(key);
                }
            }
        }
        
        
        if(pgpKeys.length === 0 && password === ""){
            return;
        }
        let pgpSignKey:PrivateKey[]=[];
        for await(const privKey of privateKey){
            if(privKey && privKey.isPrivateKey && typeof privKey.data === "string"){
                let key = await readPrivateKey({armoredKey:privKey.data}).catch(e=>{console.error(e);return null});
                if(key){
                    pgpSignKey.push(key)
                }
            }
        }
        const areAllDecrypted = pgpSignKey.every(e=>e.isDecrypted())
        
        if(pgpSignKey.length>0 && !areAllDecrypted && signMessage){
            setIsModalVisible(true);
            return;
        }
        encryptMessage(pgpKeys.length!==0?pgpKeys:password,pgpSignKey.length>0?pgpSignKey:null);
        encryptFiles(pgpKeys.length!==0?pgpKeys:password,pgpSignKey.length>0?pgpSignKey:null);

    }

    const encryptMessage = async(encryptionKeys:Key[]|string,pgpSignKey?:PrivateKey[]|null)=>{
        if(message !==""){
            const pgpMessage:Message<string>|null = await createMessage({ text: message }).catch(e => { console.error(e); return null });
            if(!pgpMessage){
                console.log("Failed to create pgpMessage from literal message");
                return;
            }
            let params;
            if(Array.isArray(encryptionKeys)){
                params = {
                    message: pgpMessage,
                    encryptionKeys: encryptionKeys,
                    signingKeys: (signMessage ? pgpSignKey : null) as MaybeArray<PrivateKey> | undefined
                }
            }else{
                params = {
                    message: pgpMessage,
                    passwords: encryptionKeys,
                    signingKeys: (signMessage ? pgpSignKey : null) as MaybeArray<PrivateKey> | undefined
                }
            }
            const response:string = await encrypt(params).then((encrypted) => {
                return encrypted;
            }).catch(e => {console.error(e); return ""});
            setMessage("");
            setPassword("");
            setEncryptedMessage(response);
        }
    }

    const encryptFiles = async(encryptionKeys:Key[]|string,pgpSignKey?:PrivateKey[]|null)=>{
        if(files.length===0){
            return;
        }
        
        setEncryptionInProgress(true);
        const newEncryptedFiles:file[] = [];
        for await(const currentFile of files){
            const pgpMessage:Message<Uint8Array>|null = await createMessage({binary:currentFile.data,filename:currentFile.fileName || "fileName.ext",format:"binary"}).catch(e => { console.error(e); return null });
            if(!pgpMessage){
                console.log("Failed to create pgpMessage from binary data");
                return;
            }
            let params;
            if(Array.isArray(encryptionKeys)){
                params = {
                    encryptionKeys: encryptionKeys,
                }
            }else{
                params = {
                    passwords: encryptionKeys,
                }
            }
            const response:Uint8Array|null = await encrypt({...params,...{message: pgpMessage, signingKeys: (signMessage ? pgpSignKey : null) as MaybeArray<PrivateKey> | undefined ,format:"binary"}}).then((encrypted) => {
                return encrypted;
            }).catch(e => {console.error(e); return null});
            
            if(!response){
                console.log("Failed to encrypt binary data");
                return;
            }
            newEncryptedFiles.push({data:response,fileName:currentFile.fileName})
        }
        setEncryptedFiles(newEncryptedFiles);
        setEncryptionInProgress(false);
    }

    return (
        <div className="p-6">
            <PassphraseModal title={t("unlockPrivKey")} text={t("enterPrivKeyPassphrase")} isVisible={isModalVisible} setIsVisible={setIsModalVisible} dataToUnlock={dataToUnlock} onConfirm={encryptData} onClose={()=>{}} />
            <div className={`flex flex-col ${encryptedMessage!==""?(''):'mb-8'}`}>
                <label htmlFor="message" className="block text-sm font-medium ">{t("message")}</label>
                <textarea id="message"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={message} onChange={(e)=>{setMessage(e.target.value)}}></textarea>
                {
                    isPopup?(null):(
                        <div className="flex w-full flex-col border-opacity-50">
                            <div className="divider">{t("or")}</div>
                                <input 
                                className="file-input file-input-bordered w-full max-w-xs file-input-info"
                                draggable={true} type="file" multiple={true}
                                onChange={(e)=>setFiles(handleDataLoaded(e) || [])}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const files = Array.from(e.dataTransfer.files);
                                    setFiles(handleDataLoadedOnDrop(files) || []);
                                }}
                                />
                        </div>
                    )
                }
                <div className="mt-1">
                    {
                        usePassword?(
                            <PassphraseTextInput value={password} setOnChange={setPassword} />
                        ):(
                            <KeyDropdown selectedKeys={selectedPubKeys} isActive={true} label={t("recipientPubKey")} keysList={pubKeysList} setSelectedKeys={setSelectedPubKeys} setActiveSection={setActiveSection} />
                        )
                    }
                    
                    <KeyDropdown selectedKeys={selectedPrivKeys} isActive={signMessage} label={t("signWithPrivKey")} keysList={privKeysList} setSelectedKeys={setSelectedPrivKeys} setActiveSection={setActiveSection} />
                    
                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">{t("signTheMessage")}</span>
                            <input type="checkbox" checked={signMessage} className="checkbox" onChange={(e)=>{setSignMessage(e.target.checked);}}/>
                        </label>
                    </div>
                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">{t("encryptWithPassword")}</span>
                            <input type="checkbox" className="checkbox" checked={usePassword} onChange={(e)=>{setUsePassword(e.target.checked);}}/>
                        </label>
                    </div>
                </div>
                <button id="encryptBtn"
                    className="btn btn-info mt-1" onClick={async ()=>{
                        encryptData(dataToUnlock)
                    }}>{t("encrypt")}</button>
            </div>

            {
            (encryptedMessage === "") ? (
                null
            ) : (
                <OutputTextarea textValue={encryptedMessage}/>
            )
            
            }
            {
                encryptionInProgress?(
                    <button className="btn btn-square">
                        <span className="loading loading-spinner"></span>
                    </button>
                ):(null)
            }

            {
            (encryptedFiles.length !== 0 && !encryptionInProgress) ? (
                <ShowGPGFiles files={encryptedFiles} extension=".gpg"/>
            ) : (null)
            }
               
        </div>
    );
}