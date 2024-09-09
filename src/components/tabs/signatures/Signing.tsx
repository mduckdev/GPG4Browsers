import { RootState, useAppSelector } from "@src/redux/store";
import { CleartextMessage, Message, PrivateKey, createCleartextMessage, createMessage, readPrivateKey, sign } from "openpgp";
import React, { useEffect, useState } from "react";
import PassphraseModal from "../../modals/PassphraseModal";
import OutputTextarea from "../../OutputTextarea";
import KeyDropdown from "../../keyDropdown";
import { CryptoKeys, MainProps, file, sectionsPropsInterface } from "@src/types";
import { getPrivateKey, getPrivateKeysAndPasswords, handleDataLoaded, handleDataLoadedOnDrop, privateKeysToCryptoKeys, updateIsKeyUnlocked } from "@src/utils";
import ShowGPGFiles from "@src/components/ShowGPGFiles";
import { useTranslation } from "react-i18next";
import { IPrivateKey } from "@src/redux/privateKeySlice";

export default function Signing({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();

    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const preferences = useAppSelector((state:RootState)=>state.preferences);
    const [dataToUnlock,setDataToUnlock] = useState<CryptoKeys[]>(privateKeysToCryptoKeys(getPrivateKey(privKeysList,preferences)));

    const [message,setMessage] = useState<string>("");
    const [signedMessage,setSignedMessage] = useState<string>("");


    const [files,setFiles] = useState<file[]>([])
    const [fileSignatures, setFileSignatures] = useState<file[]>([])

    const [selectedPrivKeys,setSelectedPrivKeys] =  useState<IPrivateKey[]>(getPrivateKey(privKeysList,preferences) || []);


    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [signingInProgress,setSigningInProgress] = useState<boolean>(false);
    const [isCleartext,setIsCleartex] = useState<boolean>(true);


    
    useEffect(()=>{
        setDataToUnlock(privateKeysToCryptoKeys(selectedPrivKeys))
    },[selectedPrivKeys])

    const signData = async (signingKeys:CryptoKeys[])=>{
        if(signingKeys.length===0){
            return;
        }
        
        if(!signingKeys.every(e=>e.isUnlocked)){
            setIsModalVisible(true);
            return;
        }
        const {privateKeys} = await getPrivateKeysAndPasswords(signingKeys);
        signMessage(privateKeys);
        signFiles(privateKeys)
    }

    const signMessage = async (privateKeys:PrivateKey[])=>{
        if(message === ""){
            return;
            //show alert with info
        }
        let signature:string|null;
        if(isCleartext){
            const messageParsed = await createCleartextMessage({text:message}).catch(e => { console.error(e); return null });
            if(!messageParsed) return //alert maybe in future
             signature = await sign({message:messageParsed,signingKeys:privateKeys}).catch(e => { console.error(e); return null });

        }else{
            const messageParsed = await createMessage({text:message}).catch(e => { console.error(e); return null });
            if(!messageParsed) return
             signature = await sign({message:messageParsed,signingKeys:privateKeys}).catch(e => { console.error(e); return null });
        }
        
        if(!signature){
            console.log("Failed to generate signature");
            return;
        }
        setSignedMessage(signature);
    }

    const signFiles = async (privateKeys:PrivateKey[])=>{
        if(files.length === 0){
            return;
            //show alert with info
        }
        setSigningInProgress(true);
        const newFileSignatures:file[] = [];
        for await(const currentFile of files){
            const pgpMessage:Message<Uint8Array>|null = await createMessage({binary:currentFile.data,format:"binary"}).catch(e => { console.error(e); return null });
            if(!pgpMessage){
                console.log("Failed to parse file");
                return;
            }
            const response:Uint8Array|null = await sign({detached:true,message:pgpMessage,signingKeys:privateKeys,format:"binary"}).catch(e => { console.error(e); return null });
            
            if(!response){
                console.log("Failed to sign file");
                return;
            }
            newFileSignatures.push({data:response,fileName:currentFile.fileName})
        }
        setFileSignatures(newFileSignatures);
        setSigningInProgress(false);

    }
    return (
    <div className="p-6">
        <PassphraseModal title={t("unlockPrivKey")} text={t("enterPrivKeyPassphrase")} isVisible={isModalVisible} dataToUnlock={dataToUnlock} setIsVisible={setIsModalVisible} onConfirm={signData} onClose={()=>{}} />
        <div className="w-full flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium">{t("message")}</label>
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
                <KeyDropdown isActive={true} label={t("signWithPrivKey")} selectedKeys={selectedPrivKeys} keysList={privKeysList} setSelectedKeys={setSelectedPrivKeys} setActiveSection={setActiveSection} />
                <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">{t("cleartextSignature")}</span>
                            <input type="checkbox" className="checkbox" checked={isCleartext} onChange={(e)=>{setIsCleartex(e.target.checked);}}/>
                        </label>
                    </div>
            <button 
                className="mt-2 btn btn-info" onClick={()=>signData(dataToUnlock)}>{t("signMessage")}</button>
        </div>
    {       
        (signedMessage === "") ? (
            null
        ) : (
            <OutputTextarea textValue={signedMessage}/>
        )
        
    }
    {
        signingInProgress?(
            <button className="btn btn-square">
                <span className="loading loading-spinner"></span>
            </button>
        ):(null)
    }

    {
        (fileSignatures.length !== 0 && !signingInProgress) ? (
            <ShowGPGFiles files={fileSignatures} extension=".sig"/>
        ) : (null)
    }
    </div>
    )
}