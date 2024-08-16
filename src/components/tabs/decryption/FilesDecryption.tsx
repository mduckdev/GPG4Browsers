import { RootState, useAppSelector } from "@src/redux/store";
import {  DecryptMessageResult, Key, KeyID, Message, PrivateKey, Subkey, decrypt, readKey, readMessage, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "@src/components/PassphraseModal";

import OutputTextarea from "@src/components/OutputTextarea";
import { handleDataLoaded } from "@src/utils";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DecryptionProps } from "@src/types";
export default function FilesDecryption() {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const [privateKeys,setPrivateKeys] = useState<string[]>([]);
    
    const [signatureMessages,setSignatureMessages] = useState<string>("");
    const [fileName, setFileName] = useState<string|null>("")

    const [encryptedFileData, setEncryptedFileData] = useState<Uint8Array|null>(null)
    const [decryptedFileData, setDecryptedFileData] = useState<string|null>(null)

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
                        setPrivateKeys([...privateKeys,privKey.armor()]);
                        return privKey;
                    }
                }
            }
        }
        return false;
    }

    const decryptMessage = async (privateKeys?:PrivateKey[])=>{
        setPrivateKeys([]);
        if((!encryptedFileData || encryptedFileData.length===0)){
            return;
        }
        const filePgpMessage:Message<Uint8Array>|null =  await readMessage({binaryMessage:encryptedFileData}).catch(e => { console.error(e); return null });
        if(!filePgpMessage){
            return;
            //show alert with information
        }
        const fileEncryptionKeys:KeyID[] = filePgpMessage.getEncryptionKeyIDs();

        const fileDecryptionKey = await findDecryptionKeyInKeyring(fileEncryptionKeys);
        const pubKeys = await Promise.all(pubKeysList.map(async e=>await readKey({armoredKey:e.keyValue})))
        if(!fileDecryptionKey){
            console.log(`Couldn't find a suitable key with IDs:${fileEncryptionKeys.map(e=>e.toHex()).join(" ")}`)            
            return;
            //show alert no key found
        }
        const areAllPrivateKeysDecrypted = privateKeys?.some((e)=>e.isDecrypted());
        if(!areAllPrivateKeysDecrypted || !privateKeys){
                setIsModalVisible(true);
                return;
        }
        

        setDecryptionInProgress(true);
        const decryptedMessage:DecryptMessageResult|null = await decrypt({message:filePgpMessage,decryptionKeys:fileDecryptionKey,verificationKeys:pubKeys}).catch(e => { console.error(e); return null });
        setDecryptionInProgress(false);

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


        setSignatureMessages(info.join("\n"))
        
    }


    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKeys={privateKeys} onConfirm={decryptMessage} onClose={()=>{}} />

            <h2 className="text-2xl font-bold mb-4 text-center">Decryption</h2>
            <div className="w-full flex flex-col">
                <input type="file" multiple={true} className="file-input file-input-bordered file-input-info w-full max-w-xs" onChange={(e)=>handleDataLoaded(e,setFileName,setEncryptedFileData,setDecryptedFileData)}/>
                <button 
                    className="mt-4 btn btn-info" onClick={()=>{decryptMessage()}}>Decrypt</button>
            </div>

       
        {
            decryptionInProgress?(
                <button className="btn btn-square">
                    <span className="loading loading-spinner"></span>
                </button>
            ):(null)
        }
        {
                (decryptedFileData && !decryptionInProgress)?(
                    <a href={decryptedFileData || ""} download={`${fileName}.gpg`}>
                        <button className="btn btn-success">
                            <FontAwesomeIcon icon={faDownload} />
                            {`${fileName}.gpg`}
                        </button>
                    </a>
                ):(null)
            }

        <p className={isMessageVerified?("text-info"):("text-error")}>{signatureMessages}</p>
        </div>
    );
}