import { RootState, useAppSelector } from "@src/redux/store";
import { Key, MaybeArray, Message, PrivateKey, createMessage, decryptKey, encrypt, readKey, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "@src/components/PassphraseModal";
import OutputTextarea from "@src/components/OutputTextarea";
import KeyDropdown from "@src/components/keyDropdown";
import { MainProps } from "@src/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { handleDataLoaded } from "@src/utils";

export default function MessageEncryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [selectedPubKey,setSelectedPubKey] =  useState<string>(pubKeysList[0]?.keyValue || "");
    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");

    const [message,setMessage] =  useState<string>("");
    const [encryptedMessage,setEncryptedMessage] =  useState<string>("");
    const [fileName, setFileName] = useState<string|null>("")
    const [fileData, setFileData] = useState<Uint8Array|null>(null)
    const [encryptedFileData, setEncryptedFileData] = useState<string|null>(null)


    const [signMessage,setSignMessage] = useState<boolean>(true);
    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [encryptionInProgress,setEncryptionInProgress] = useState<boolean>(false);
    


    const encryptMessage = async(privateKey?:PrivateKey[])=>{
        if((message==="" && (!fileData || fileData.length===0)) || selectedPubKey===""){
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
            const pgpMessage:Message<Uint8Array>|null = await createMessage({binary:fileData,filename:fileName || "fileName.ext",format:"binary"}).catch(e => { console.error(e); return null });
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



    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKeys={[selectedPrivKey]} onConfirm={encryptMessage} onClose={()=>{}} />
            <div className={`flex flex-col ${encryptedMessage!==""?(''):'mb-8'}`}>
                <label htmlFor="message" className="block text-sm font-medium ">Message:</label>
                <textarea id="message"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={message} onChange={(e)=>{setMessage(e.target.value)}}></textarea>
                
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
                        encryptMessage(key?[key]:[])
                    }}>Encrypt</button>
            </div>

            {
            (encryptedMessage === "") ? (
                null
            ) : (
                <OutputTextarea textValue={encryptedMessage}/>
            )
            
            }
               
        </div>
    );
}