import { RootState, useAppSelector } from "@src/redux/store";
import { Key, MaybeArray, Message, PrivateKey, createMessage, encrypt, readKey, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "@src/components/PassphraseModal";
import OutputTextarea from "@src/components/OutputTextarea";
import KeyDropdown from "@src/components/keyDropdown";
import { MainProps, file } from "@src/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { convertUint8ToUrl, handleDataLoaded, handleDataLoadedOnDrop } from "@src/utils";

export default function Encryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [selectedPubKey,setSelectedPubKey] =  useState<string>(pubKeysList[0]?.keyValue || "");
    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");

    const [message,setMessage] =  useState<string>("");
    const [encryptedMessage,setEncryptedMessage] =  useState<string>("");


    const [files,setFiles] = useState<file[]>([])
    const [encryptedFiles, setEncryptedFiles] = useState<file[]>([])

    const [signMessage,setSignMessage] = useState<boolean>(true);
    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [encryptionInProgress,setEncryptionInProgress] = useState<boolean>(false);
    


    const encryptData = async (privateKey?:PrivateKey[])=>{
        if(selectedPubKey===""){
            return;
        }
        const pgpKey:Key|null = await readKey({armoredKey:selectedPubKey}).catch(e => { console.error(e); return null });
        if(!pgpKey){
            return;
        }
        let pgpSignKey:PrivateKey|null=null;
        if(privateKey && privateKey[0]){
            pgpSignKey = privateKey[0]
        }
        if(pgpSignKey && !pgpSignKey.isDecrypted() && signMessage){
            setIsModalVisible(true);
            return;
        }
        encryptMessage([pgpKey],pgpSignKey?[pgpSignKey]:null);
        encryptFiles([pgpKey],pgpSignKey?[pgpSignKey]:null);

    }

    const encryptMessage = async(encryptionKeys:Key[],pgpSignKey?:PrivateKey[]|null)=>{
        if(message !==""){
            const pgpMessage:Message<string>|null = await createMessage({ text: message }).catch(e => { console.error(e); return null });
            if(!pgpMessage){
                console.log("Failed to create pgpMessage from literal message");
                return;
            }
            const response:string = await encrypt({
                message: pgpMessage,
                encryptionKeys: encryptionKeys,
                signingKeys: (signMessage ? pgpSignKey : null) as MaybeArray<PrivateKey> | undefined
            }).then((encrypted) => {
                return encrypted;
            }).catch(e => {console.error(e); return ""});
            setMessage("");
            setEncryptedMessage(response);
        }
    }

    const encryptFiles = async(encryptionKeys:Key[],pgpSignKey?:PrivateKey[]|null)=>{
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
            const response:Uint8Array|null = await encrypt({
                message: pgpMessage,
                encryptionKeys: encryptionKeys,
                format:"binary",
                signingKeys: (signMessage ? pgpSignKey : null) as MaybeArray<PrivateKey> | undefined
            }).then((encrypted) => {
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
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKeys={[selectedPrivKey]} onConfirm={encryptData} onClose={()=>{}} />
            <div className={`flex flex-col ${encryptedMessage!==""?(''):'mb-8'}`}>
                <label htmlFor="message" className="block text-sm font-medium ">Message:</label>
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
                <div className="mt-3">
                    <KeyDropdown isActive={true} label="Recipient's public key:" keysList={pubKeysList} setSelectedKey={setSelectedPubKey} setActiveSection={setActiveSection} />

                    <KeyDropdown isActive={signMessage} label="Sign with private key:" keysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
                    
                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">Sign the message</span>
                            <input type="checkbox" defaultChecked={signMessage} className="checkbox" onChange={(e)=>{setSignMessage(e.target.checked);}}/>
                        </label>
                    </div>
                </div>
                <button id="encryptBtn"
                    className="btn btn-info mt-2" onClick={async ()=>{
                        const key = await readPrivateKey({armoredKey:selectedPrivKey}).catch(e=>{console.error(e);return null});
                        encryptData(key?[key]:[])
                    }}>Encrypt</button>
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
                <div className="flex gap-2 mt-2">
                {encryptedFiles.map((e: file,index:number) => (
                        <a href={convertUint8ToUrl(e.data) || ""} download={`${e.fileName}.gpg`} key={index}>
                            <button className="btn btn-success">
                            <FontAwesomeIcon icon={faDownload} />
                            {`${e.fileName}.gpg`}
                            </button>
                        </a>
                ))}
                </div>
            ) : (null)
            }
               
        </div>
    );
}