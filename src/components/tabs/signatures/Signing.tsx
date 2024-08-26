import { RootState, useAppSelector } from "@src/redux/store";
import { CleartextMessage, Message, PrivateKey, createCleartextMessage, createMessage, readPrivateKey, sign } from "openpgp";
import React, { useEffect, useState } from "react";
import PassphraseModal from "../../PassphraseModal";
import OutputTextarea from "../../OutputTextarea";
import KeyDropdown from "../../keyDropdown";
import { CryptoKeys, MainProps, file, sectionsPropsInterface } from "@src/types";
import { getPrivateKeysAndPasswords, handleDataLoaded, handleDataLoadedOnDrop, updateIsKeyUnlocked } from "@src/utils";
import ShowGPGFiles from "@src/components/ShowGPGFiles";

export default function Signing({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [message,setMessage] = useState<string>("");
    const [signedMessage,setSignedMessage] = useState<string>("");


    const [files,setFiles] = useState<file[]>([])
    const [fileSignatures, setFileSignatures] = useState<file[]>([])

    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [isSelectedPrivateKeyUnlocked,setIsSelectedPrivateKeyUnlocked] = useState<boolean>(false);
    const [signingInProgress,setSigningInProgress] = useState<boolean>(false);

    
    useEffect(()=>{
        updateIsKeyUnlocked(selectedPrivKey,setIsSelectedPrivateKeyUnlocked);
    },[selectedPrivKey])

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
        
        const messageParsed:CleartextMessage|null = await createCleartextMessage({text:message}).catch(e => { console.error(e); return null });
        if(!messageParsed){
            console.log("Failed to generate parse message");
            return;
        }
        const signature:string|null = await sign({message:messageParsed,signingKeys:privateKeys}).catch(e => { console.error(e); return null });
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
        <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key:" isVisible={isModalVisible} dataToUnlock={[{data:selectedPrivKey,isPrivateKey:true,isUnlocked:isSelectedPrivateKeyUnlocked}]} setIsVisible={setIsModalVisible} onConfirm={signData} onClose={()=>{}} />
        <div className="w-full flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium">Message</label>
            <textarea id="message"
                className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={message} onChange={(e)=>{setMessage(e.target.value)}}></textarea>
                {
                    isPopup?(null):(
                        <div className="flex w-full flex-col border-opacity-50">
                            <div className="divider">OR</div>
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
                <KeyDropdown isActive={true} label="Sign with private key:" keysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
            <button 
                className="mt-4 btn btn-info" onClick={()=>signData([{data:selectedPrivKey,isPrivateKey:true,isUnlocked:isSelectedPrivateKeyUnlocked}])}>Sign message</button>
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