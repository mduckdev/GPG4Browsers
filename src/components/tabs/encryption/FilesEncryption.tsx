import { RootState, useAppSelector } from "@src/redux/store";
import { Key, MaybeArray, Message, PrivateKey, createMessage, encrypt, readKey, readPrivateKey } from "openpgp";
import React, { useEffect, useState } from "react";
import PassphraseModal from "@src/components/PassphraseModal";
import KeyDropdown from "@src/components/keyDropdown";
import { MainProps, file } from "@src/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { convertUint8ToUrl, handleDataLoaded } from "@src/utils";

export default function FilesEncryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [selectedPubKey,setSelectedPubKey] =  useState<string>(pubKeysList[0]?.keyValue || "");
    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");

    const [files,setFiles] = useState<file[]>([])
    const [encryptedFiles, setEncryptedFiles] = useState<file[]>([])


    const [signMessage,setSignMessage] = useState<boolean>(true);
    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [encryptionInProgress,setEncryptionInProgress] = useState<boolean>(false);
    
    const encryptMessage = async(privateKey?:PrivateKey[])=>{
        if(files.length===0 || selectedPubKey===""){
            return;
        }
        const pgpKey:Key|null = await readKey({armoredKey:selectedPubKey}).catch(e => { console.error(e); return null });
        if(!pgpKey){
            return;
        }
        let pgpSignKey:PrivateKey|null=null;
        if(privateKey){
            pgpSignKey = privateKey[0]
        }
        
        if(pgpSignKey && !pgpSignKey?.isDecrypted() && signMessage){
            setIsModalVisible(true);
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
                encryptionKeys: pgpKey,
                format:"binary",
                signingKeys: (signMessage ? [pgpSignKey] : null) as MaybeArray<PrivateKey> | undefined
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
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKeys={[selectedPrivKey]} onConfirm={encryptMessage} onClose={()=>{}} />
            <div className={`flex flex-col`}>
                <input type="file" multiple={true} className="file-input file-input-bordered file-input-info w-full max-w-xs" onChange={(e)=>setFiles(handleDataLoaded(e) || [])}/>
                
                <div className="mt-3">
                    <KeyDropdown isActive={true} label="Recipient's public key:" keysList={privKeysList} setSelectedKey={setSelectedPubKey} setActiveSection={setActiveSection} />

                    <KeyDropdown isActive={signMessage} label="Sign with private key:" keysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
                    
                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">Sign the files</span>
                            <input type="checkbox" defaultChecked={signMessage} className="checkbox" onChange={(e)=>{setSignMessage(e.target.checked);}}/>
                        </label>
                    </div>
                </div>
                <button id="encryptBtn"
                    className="btn btn-info mt-2" onClick={async ()=>{const key = await readPrivateKey({armoredKey:selectedPrivKey});encryptMessage([key])}}>Encrypt</button>
            </div>

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