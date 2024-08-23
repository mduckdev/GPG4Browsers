import { RootState, useAppSelector } from "@src/redux/store";
import {  DecryptMessageResult, Key, KeyID, Message, PrivateKey, Subkey, decrypt, readKey, readMessage, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "@src/components/PassphraseModal";

import OutputTextarea from "@src/components/OutputTextarea";
import { MainProps, decryptedFile, file } from "@src/types";
import { convertUint8ToUrl, formatBytes, handleDataLoaded, handleDataLoadedOnDrop } from "@src/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
export default function Decryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);

    const [decryptionKeys,setDecryptionKeys] = useState<string[]>([]);
    
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
                        // setDecryptionKeys([...decryptionKeys,privKey.armor()]);
                        return privKey.armor();
                    }
                }
            }
        }
        return false;
    }


    const decryptData = async (privateKeys?:PrivateKey[])=>{
        const decryptionKeysNeeded:string[] = [];
        let parsedFiles:Message<Uint8Array>[]=[];
        for await(const currentFile of encryptedFiles){
            const pgpMessage:Message<Uint8Array>|null = await readMessage({binaryMessage:currentFile.data}).catch(e => { console.error(e); return null });
            if(!pgpMessage ){
                // setDecryptionInProgress(false);
                continue;
                //show alert with information
            }
            const messageEncryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
            let messageDecryptionKey = await findDecryptionKeyInKeyring(messageEncryptionKeys);

            if(!messageDecryptionKey){
                console.log(`Couldn't find a suitable key with IDs:${messageEncryptionKeys.map(e=>e.toHex()).join(" ")}`)            
                continue;
                //show alert no key found
            }
            parsedFiles.push(pgpMessage);
            if(messageDecryptionKey && !decryptionKeysNeeded.includes(messageDecryptionKey)){
                decryptionKeysNeeded.push(messageDecryptionKey);
            }
        }
        const pgpMessage:Message<string>|null = await readMessage({armoredMessage:encryptedMessage}).catch(e => { console.error(e); return null });
        if(pgpMessage){
            const messageEncryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
            const messageDecryptionKey = await findDecryptionKeyInKeyring(messageEncryptionKeys);
            if(!messageDecryptionKey){
                console.log(`Couldn't find a suitable key with IDs:${messageEncryptionKeys.map(e=>e.toHex()).join(" ")}`)            
                // return;
                //show alert no key found
            }
            if(messageDecryptionKey && !decryptionKeysNeeded.includes(messageDecryptionKey)){
                decryptionKeysNeeded.push(messageDecryptionKey)
            }
        }
        setDecryptionKeys(decryptionKeysNeeded);
        if(decryptionKeysNeeded.length === 0){
            return;
        };

        let parsedPrivateKeys:PrivateKey[]=[];
        if(!privateKeys || privateKeys.length===0){
            parsedPrivateKeys = await Promise.all(decryptionKeysNeeded.map(async e=>await readPrivateKey({armoredKey:e})))
            const areAllPrivateKeysDecrypted = parsedPrivateKeys.every((e) => e.isDecrypted());
            if(!areAllPrivateKeysDecrypted){
                    setIsModalVisible(true);
                    return;
            }
        }else{
            parsedPrivateKeys=privateKeys;
        }
        const parsedPublicKeys = await Promise.all(pubKeysList.map(async e=>await readKey({armoredKey:e.keyValue})))

        if(pgpMessage){
            decryptMessage(pgpMessage,parsedPrivateKeys,parsedPublicKeys)
        }
        if(encryptedFiles.length>0){
            decryptFiles(parsedPrivateKeys,parsedPublicKeys)
        }
    }

    const decryptMessage = async (pgpMessage:Message<string>,privateKeys:PrivateKey[],publicKeys:Key[])=>{
        if(encryptedMessage===""){
            return;
        }
        
        const decryptedMessage:DecryptMessageResult|null = await decrypt({message:pgpMessage,decryptionKeys:privateKeys,verificationKeys:publicKeys}).catch(e => { console.error(e); return null });

        if(!decryptedMessage){
            console.log("Failed to decrypt the message.");
            return;
        }

        let verified = false;
        setIsMessageVerified(false);
        let info = [];
        for (const signature of decryptedMessage.signatures){
            let isVerified = await signature.verified.catch(e=>{return false});
            if(isVerified){
                info.push(`Valid message signature with keyID: ${signature.keyID.toHex()}`)
                verified=true;
                setIsMessageVerified(true)
            }
        }
        info.push(verified?(""):("Message authenticity could not be verified."))
        setSignatureMessages(info.join("\n"))
        setDecryptedMessage(decryptedMessage.data.toString());
    }
    const decryptFiles = async (privateKeys:PrivateKey[],publicKeys:Key[])=>{
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
            const decryptedMessage:DecryptMessageResult|null = await decrypt({message:pgpMessage,decryptionKeys:privateKeys,verificationKeys:publicKeys,format:"binary"}).catch(e => { console.error(e); return null });

            if(!decryptedMessage){
                console.log(`Failed to decrypt file ${currentFile.fileName}.`);
                continue;
            }
            let verified = false;
            let info = [];
            for (const signature of decryptedMessage.signatures){
                let isVerified = await signature.verified.catch(e=>{return false});
                if(isVerified){
                    info.push(`Valid signature with keyID: ${signature.keyID.toHex()}`)
                    verified=true;
                }
            }
            if(!verified){
                info=["Message authenticity could not be verified."]
            }
            const newDecryptedFile:decryptedFile = {
                data:decryptedMessage.data as Uint8Array,
                fileName:currentFile.fileName,
                signatureMessages:info,
                signatureStatus:verified?"text-info":"text-error"
            } 
            newDecryptedFiles.push(newDecryptedFile);
        }

        setDecryptionInProgress(false);
        setDecryptedFiles(newDecryptedFiles);
    }

    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key:" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKeys={decryptionKeys} onConfirm={decryptData} onClose={()=>{}} />

            <div className="w-full flex flex-col">
                <label htmlFor="message" className="block text-sm font-medium">Encrypted message:</label>
                <textarea id="message"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={encryptedMessage} onChange={(e)=>{setEncryptedMessage(e.target.value)}}></textarea>
 {
                    isPopup?(null):(
                        <div className="flex w-full flex-col border-opacity-50">
                            <div className="divider">OR</div>
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
                    className="mt-4 btn btn-info" onClick={()=>{decryptData()}}>Decrypt</button>
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
                <div className="overflow-x-auto mb-3">
                    <div className="divider">FILES</div>

                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr>
                                <th>Nr</th>
                                <th>File</th>
                                <th>Signature info</th>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                        {/* row 1 */}
                        {decryptedFiles.map((e: decryptedFile,index:number) => (
                            <tr key={index}>
                                <th>{++index}</th>
                                <td>
                                    <a href={convertUint8ToUrl(e.data) || ""} download={e.fileName.replace(/\.(gpg|pgp|asc|sig)$/, '')} key={index}>
                                        <button className="btn btn-success">
                                        <FontAwesomeIcon icon={faDownload} />
                                        {e.fileName.replace(/\.(gpg|pgp|asc|sig)$/, '')}
                                        </button>
                                    </a>
                                </td>
                                <td className={`${e.signatureStatus}`}>{e.signatureMessages}</td>
                                <td>{formatBytes(e.data.length)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                
            ) : (null)
            }

        </div>
    );
}