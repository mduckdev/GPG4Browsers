import { RootState, useAppSelector } from "@src/redux/store";
import {  DecryptMessageResult, Key, KeyID, Message, PrivateKey, Subkey, decrypt, decryptKey, readKey, readMessage, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "./PassphraseModal";

import OutputTextarea from "./OutputTextarea";
export default function Decryption({}) {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const [privateKey,setPrivateKey] = useState<string>("");
    
    const [encryptedMessage,setEncryptedMessage] = useState<string>("");
    const [decryptedMessage,setDecryptedMessage] = useState<string>("");
    const [signatureMessages,setSignatureMessages] = useState<string>("");

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [isMessageVerified,setIsMessageVerified] = useState<boolean>(false);



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
                        setPrivateKey(privKey.armor());
                        return privKey;
                    }
                }
            }
        }
        return false;
    }

    const decryptMessage = async (privateKey?:PrivateKey)=>{
        const pgpMessage:Message<string>|null = await readMessage({armoredMessage:encryptedMessage}).catch(e => { console.error(e); return null });
        if(!pgpMessage){
            return;
            //show alert with information
        }
        const encryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
        let decryptionKey = await findDecryptionKeyInKeyring(encryptionKeys);
        const pubKeys = await Promise.all(pubKeysList.map(async e=>await readKey({armoredKey:e.keyValue})))
        if(!decryptionKey){
            console.log(`Couldn't find a suitable key with IDs:${encryptionKeys.map(e=>e.toHex()).join(" ")}`)            
            return;
            //show alert no key found
        }
        if(!decryptionKey.isDecrypted() && !privateKey){
                setIsModalVisible(true);
                return;
        }
        if(privateKey?.isDecrypted()){
            decryptionKey=privateKey;
        }

        const decryptedMessage:DecryptMessageResult|null = await decrypt({message:pgpMessage,decryptionKeys:decryptionKey,verificationKeys:pubKeys}).catch(e => { console.error(e); return null });

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
        setDecryptedMessage(decryptedMessage.data.toString());
        
    }


    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key:" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKey={privateKey} onConfirm={decryptMessage} onClose={()=>{}} />

            <h2 className="text-2xl font-bold mb-4 text-center">Decryption</h2>
            <div className="w-full flex flex-col">
                <label htmlFor="message" className="block text-sm font-medium">Encrypted message:</label>
                <textarea id="message"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={encryptedMessage} onChange={(e)=>{setEncryptedMessage(e.target.value)}}></textarea>
                <button 
                    className="mt-4 btn btn-info" onClick={()=>{decryptMessage()}}>Decrypt</button>
            </div>

            {
  (decryptedMessage === "") ? (
    null
  ) : (
   <OutputTextarea textValue={decryptedMessage}/>
   
  )
}

        <p className={isMessageVerified?("text-info"):("text-error")}>{signatureMessages}</p>
        </div>
    );
}