import { RootState, useAppSelector } from "@src/redux/store";
import {  DecryptMessageResult, Key, KeyID, Message, PrivateKey, Subkey, decrypt, readKey, readMessage, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "@src/components/PassphraseModal";

import OutputTextarea from "@src/components/OutputTextarea";
import { convertUint8ToUrl, handleDataLoaded } from "@src/utils";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DecryptionProps, file } from "@src/types";
export default function FilesDecryption() {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const [decryptionKeys,setDecryptionKeys] = useState<string[]>([]);

    
    const [signatureMessages,setSignatureMessages] = useState<string>("");
    const [fileName, setFileName] = useState<string|null>("")

    const [encryptedFiles, setEncryptedFiles] = useState<file[]>([])
    const [decryptedFiles, setDecryptedFiles] = useState<file[]>([])

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
                        setDecryptionKeys([...decryptionKeys,privKey.armor()]);
                        return privKey;
                    }
                }
            }
        }
        return false;
    }

    const decryptFiles = async (privateKeys?:PrivateKey[])=>{
               
        if(encryptedFiles.length===0 || !encryptedFiles[0]){
            return;
        }

        const pgpMessage:Message<Uint8Array>|null = await readMessage({binaryMessage:encryptedFiles[0].data}).catch(e => { console.error(e); return null });

        if(!pgpMessage ){
            return;
            //show alert with information
        }

        const messageEncryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
        let messageDecryptionKey = await findDecryptionKeyInKeyring(messageEncryptionKeys);
        
        const pubKeys = await Promise.all(pubKeysList.map(async e=>await readKey({armoredKey:e.keyValue})))
        if(!messageDecryptionKey){
            console.log(`Couldn't find a suitable key with IDs:${messageEncryptionKeys.map(e=>e.toHex()).join(" ")}`)            
            return;
            //show alert no key found
        }
        if(!privateKeys){
            const parsed = await Promise.all(decryptionKeys.map(async e=>await readPrivateKey({armoredKey:e})))

            const areAllPrivateKeysDecrypted = parsed?.some((e) => !e.isDecrypted());
            if(!areAllPrivateKeysDecrypted || !decryptionKeys){
                    setIsModalVisible(true);
                    return;
            }
        }
        
        setDecryptionInProgress(true);
        const decryptedMessage:DecryptMessageResult|null = await decrypt({message:pgpMessage,decryptionKeys:privateKeys,verificationKeys:pubKeys,format:"binary"}).catch(e => { console.error(e); return null });

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
                info.push(`Valid signature with keyID: ${signature.keyID.toHex()}`)
                verified=true;
                setIsMessageVerified(true)
            }
        }
        info.push(verified?(""):("Message authenticity could not be verified."))

        setDecryptionInProgress(false);
        let blob = new Blob([decryptedMessage.data as Uint8Array],{type:"application/octet-stream"})
        setDecryptedFiles([{data:decryptedMessage.data as Uint8Array,fileName:decryptedMessage.filename}])
        setSignatureMessages(info.join("\n"))
        
    }


    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKeys={decryptionKeys} onConfirm={decryptFiles} onClose={()=>{}} />

            <h2 className="text-2xl font-bold mb-4 text-center">Decryption</h2>
            <div className="w-full flex flex-col">
                <input type="file" multiple={true} className="file-input file-input-bordered file-input-info w-full max-w-xs" onChange={(e)=>{setEncryptedFiles(handleDataLoaded(e) || []);setSignatureMessages("")}}/>
                <button 
                    className="mt-4 btn btn-info" onClick={()=>{decryptFiles()}}>Decrypt</button>
            </div>

       
        {
            decryptionInProgress?(
                <button className="btn btn-square">
                    <span className="loading loading-spinner"></span>
                </button>
            ):(null)
        }
        {
            (decryptedFiles.length !== 0 && !decryptionInProgress) ? (
                <div className="flex gap-2 mt-2">
                {encryptedFiles.map((e: file,index:number) => (
                        <a href={convertUint8ToUrl(e.data) || ""} download={e.fileName.replace(/\.(gpg|pgp|asc|sig)$/, '')} key={index}>
                            <button className="btn btn-success">
                            <FontAwesomeIcon icon={faDownload} />
                            {e.fileName.replace(/\.(gpg|pgp|asc|sig)$/, '')}
                            </button>
                        </a>
                ))}
                </div>
            ) : (null)
            }

        <p className={isMessageVerified?("text-info"):("text-error")}>{signatureMessages}</p>
        </div>
    );
}