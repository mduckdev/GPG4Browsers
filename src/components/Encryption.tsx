import { RootState, useAppSelector } from "@src/redux/store";
import { Key, MaybeArray, Message, PrivateKey, createMessage, decryptKey, encrypt, readKey, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "./PassphraseModal";
import OutputTextarea from "./OutputTextarea";
import KeyDropdown from "./keyDropdown";
import { MainProps } from "@src/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

export default function Encryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [selectedPubKey,setSelectedPubKey] =  useState<string>(pubKeysList[0]?.keyValue || "");
    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");

    const [message,setMessage] =  useState<string>("");
    const [encryptedMessage,setEncryptedMessage] =  useState<string>("");
    const [fileName, setFileName] = useState<string>("")
    const [fileData, setFileData] = useState<Uint8Array|null>(null)
    const [encryptedFileData, setEncryptedFileData] = useState<string|null>(null)


    const [signMessage,setSignMessage] = useState<boolean>(true);
    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [encryptionInProgress,setEncryptionInProgress] = useState<boolean>(false);


    const encryptMessage = async(privateKey?:string)=>{
        if((message==="" && (!fileData || fileData.length===0)) || selectedPubKey===""){
            return;
        }
        const pgpKey:Key|null = await readKey({armoredKey:selectedPubKey}).catch(e => { console.error(e); return null });
        if(!pgpKey){
            return;
        }
        let pgpSignKey:PrivateKey|null=null;
        if(privateKey){
            pgpSignKey = (await readPrivateKey({armoredKey:privateKey}).catch(e => { console.error(e); return null }));
        }
        
        if(pgpSignKey && !pgpSignKey?.isDecrypted() && signMessage){
            setIsModalVisible(true);
            return;
        }

        if(message !==""){
            const pgpMessage:Message<string>|null = await createMessage({ text: message }).catch(e => { console.error(e); return null });
            if(!pgpMessage){
                console.log("Failed to create pgpMessage from literal message");
                return;
            }
            const response:string = await encrypt({
                message: pgpMessage,
                encryptionKeys: pgpKey,
                signingKeys: (signMessage ? [pgpSignKey] : null) as MaybeArray<PrivateKey> | undefined
            }).then((encrypted) => {
                return encrypted;
            }).catch(e => {console.error(e); return ""});
            setMessage("");
            setEncryptedMessage(response);
        }
        if(fileData && fileData.length!==0){
            const pgpMessage:Message<Uint8Array>|null = await createMessage({binary:fileData,filename:fileName,format:"binary"}).catch(e => { console.error(e); return null });
            if(!pgpMessage){
                console.log("Failed to create pgpMessage from binary data");
                return;
            }
            setEncryptionInProgress(true);
            const response:Uint8Array|null = await encrypt({
                message: pgpMessage,
                encryptionKeys: pgpKey,
                format:"binary",
                signingKeys: (signMessage ? [pgpSignKey] : null) as MaybeArray<PrivateKey> | undefined
            }).then((encrypted) => {
                setEncryptionInProgress(false);
                return encrypted;
            }).catch(e => {console.error(e);setEncryptionInProgress(false); return null});
            
            if(!response){
                console.log("Failed to encrypt binary data");
                return;
            }
            let blob = new Blob([response],{type:"application/octet-stream"})
            setEncryptedFileData(window.URL.createObjectURL(blob));
        }
    }

    const handleDataLoaded=(event:React.ChangeEvent<HTMLInputElement>)=> {
        if(!event?.target.files){
            return;
        }
        
        const file = event.target.files[0];
        if(file.name){
            setFileName(file.name);
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            if(!event.target){
                return
            }
            if(event.target.result instanceof ArrayBuffer){
                let uint = new Uint8Array(event.target.result);
                setFileData(uint);
                setEncryptedFileData(null);
            }

        };
        reader.readAsArrayBuffer(file);
    }

    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKey={selectedPrivKey} onConfirm={encryptMessage} onClose={()=>{}} />

            <h2 className="text-2xl font-bold mb-4 text-center">Encryption</h2>
            <div className={`flex flex-col ${encryptedMessage!==""?(''):'mb-8'}`}>
                <label htmlFor="message" className="block text-sm font-medium ">Message:</label>
                <textarea id="message"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={message} onChange={(e)=>{setMessage(e.target.value)}}></textarea>
                {
                    isPopup?(null):(
                <div>
                    <div className="divider">OR</div>
                    <input type="file" className="file-input file-input-bordered file-input-info w-full max-w-xs" onChange={(e)=>handleDataLoaded(e)}/>
                </div>
                    )
                }
                
                <div className="mt-3">
                    <KeyDropdown isActive={true} label="Recipient's public key:" keysList={privKeysList} setSelectedKey={setSelectedPubKey} setActiveSection={setActiveSection} />

                    <KeyDropdown isActive={signMessage} label="Sign with private key:" keysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
                    
                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">Sign the message</span>
                            <input type="checkbox" defaultChecked={signMessage} className="checkbox" onChange={(e)=>{setSignMessage(e.target.checked);}}/>
                        </label>
                    </div>
                </div>
                <button id="encryptBtn"
                    className="btn btn-info mt-2" onClick={()=>encryptMessage(selectedPrivKey)}>Encrypt</button>
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
                (encryptedFileData && !encryptionInProgress)?(
                    <a href={encryptedFileData || ""} download={`${fileName}.gpg`}>
                        <button className="btn btn-success">
                            <FontAwesomeIcon icon={faDownload} />
        
                            {`${fileName}.gpg`}
                        </button>
                    </a>
                ):(null)
            }
                            
               
        </div>
    );
}