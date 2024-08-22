import { RootState, useAppSelector } from "@src/redux/store";
import {  DecryptMessageResult, Key, KeyID, Message, PrivateKey, Subkey, decrypt, readKey, readMessage, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "@src/components/PassphraseModal";
import { convertUint8ToUrl, formatBytes, handleDataLoaded } from "@src/utils";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { decryptedFile, file } from "@src/types";
export default function FilesDecryption() {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const [decryptionKeys,setDecryptionKeys] = useState<string[]>([]);

    
    const [signatureMessages,setSignatureMessages] = useState<string>("");

    const [encryptedFiles, setEncryptedFiles] = useState<file[]>([])
    const [decryptedFiles, setDecryptedFiles] = useState<decryptedFile[]>([])

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [decryptionInProgress,setDecryptionInProgress] = useState<boolean>(false);

    const findDecryptionKeyInKeyring = async (encryptionKeys:KeyID[]):Promise<string|null> =>{
        for(const privateKey of privKeysList){
            const privKey:PrivateKey|null = await readPrivateKey({armoredKey:privateKey.keyValue}).catch(e => { console.error(e); return null });
            if(!privKey){
                continue;
            }
            // see https://github.com/openpgpjs/openpgpjs/issues/1693
            //
            //@ts-ignore
            const privKeyDecryptionKeys:(Key | Subkey)[] = await privKey.getDecryptionKeys()

            for(const privKeyDecryptionKey of privKeyDecryptionKeys){
                const decryptionKeyID = privKeyDecryptionKey.getKeyID();
                for(const encryptionKey of encryptionKeys){
                    if(decryptionKeyID.equals(encryptionKey)){
                        return privKey.armor();
                    }
                }
            }
        }
        return null;
    }

    const decryptFiles = async (privateKeys?:PrivateKey[])=>{
               
        if(encryptedFiles.length===0 || !encryptedFiles[0]){
            return;
        }
        const decryptionKeysNeeded:string[] = []
        for await(const currentFile of encryptedFiles){
            const pgpMessage:Message<Uint8Array>|null = await readMessage({binaryMessage:currentFile.data}).catch(e => { console.error(e); return null });
            if(!pgpMessage ){
                setDecryptionInProgress(false);
                return;
                //show alert with information
            }
            const messageEncryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
            let messageDecryptionKey = await findDecryptionKeyInKeyring(messageEncryptionKeys);

            if(!messageDecryptionKey){
                console.log(`Couldn't find a suitable key with IDs:${messageEncryptionKeys.map(e=>e.toHex()).join(" ")}`)            
                continue;
                //show alert no key found
            }
            if(messageDecryptionKey && !decryptionKeysNeeded.includes(messageDecryptionKey)){
                decryptionKeysNeeded.push(messageDecryptionKey);
            }
        }
        if(decryptionKeysNeeded.length === 0){
            return;
        }
        setDecryptionKeys(decryptionKeysNeeded);
        const newDecryptedFiles:decryptedFile[] = [];
        setDecryptionInProgress(true);
        for await(const currentFile of encryptedFiles){
            const pgpMessage:Message<Uint8Array>|null = await readMessage({binaryMessage:currentFile.data}).catch(e => { console.error(e); return null });
            if(!pgpMessage ){
                setDecryptionInProgress(false);
                return;
                //show alert with information
            }

            const pubKeys = await Promise.all(pubKeysList.map(async e=>await readKey({armoredKey:e.keyValue})))
            
            if(!privateKeys || privateKeys.length===0){
                const parsed = await Promise.all(decryptionKeysNeeded.map(async e=>await readPrivateKey({armoredKey:e})))
                
                const areAllPrivateKeysDecrypted = parsed.every((e) => e.isDecrypted());
                if(!areAllPrivateKeysDecrypted){
                        setIsModalVisible(true);
                        return;
                }
            }

            const decryptionKeysParsed = privateKeys?(privateKeys):(await Promise.all(decryptionKeysNeeded.map(async e=>await readPrivateKey({armoredKey:e}))))
            const decryptedMessage:DecryptMessageResult|null = await decrypt({message:pgpMessage,decryptionKeys:decryptionKeysParsed,verificationKeys:pubKeys,format:"binary"}).catch(e => { console.error(e); return null });

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
            <PassphraseModal title="Unlock private key" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKeys={decryptionKeys} onConfirm={decryptFiles} onClose={()=>{}} />
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
                <div className="overflow-x-auto mb-3">
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