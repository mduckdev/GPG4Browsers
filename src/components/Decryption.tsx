import { RootState, useAppSelector } from "@src/redux/store";
import {  Key, KeyID, Message, PrivateKey, Subkey, decrypt, decryptKey, readMessage, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "./PassphraseModal";

import OutputTextarea from "./OutputTextarea";
export default function Decryption() {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    
    const [encryptedMessage,setEncryptedMessage] = useState<string>("");
    const [decryptedMessage,setDecryptedMessage] = useState<string>("");
    const [privateKeyPassphrase,setPrivateKeyPassphrase] =  useState<string>("");


    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);


    const findDecryptionKeyInKeyring = async (encryptionKeys:KeyID[]) =>{
        for(const privateKey of privKeysList){
            const privKey:PrivateKey = await readPrivateKey({armoredKey:privateKey.privateKeyValue});
            // see https://github.com/openpgpjs/openpgpjs/issues/1693
            //
            //@ts-ignore
            const privKeyDecryptionKeys:(Key | Subkey)[] = await privKey.getDecryptionKeys()

            for(const privKeyDecryptionKey of privKeyDecryptionKeys){
                const decryptionKeyID = privKeyDecryptionKey.getKeyID();
                for(const encryptionKey of encryptionKeys){
                    if(decryptionKeyID.equals(encryptionKey)){
                        return privKey;
                    }
                }
            }
            
            return false;
        }
    }

    const decryptMessage = async (message:string,passphrase?:string)=>{
        const pgpMessage:Message<string> = await readMessage({armoredMessage:message})
        const encryptionKeys:KeyID[] = pgpMessage.getEncryptionKeyIDs();
        let decryptionKey = await findDecryptionKeyInKeyring(encryptionKeys);
        if(!decryptionKey){
            console.log(`Couldn't find a suitable key with IDs:${encryptionKeys.map(e=>e.toHex()).join(" ")}`)            
            return;
            //show alert no key found
        }
        if(!decryptionKey.isDecrypted()){
            if(privateKeyPassphrase===""){
                setIsModalVisible(true);
                return;
            }else{
                const decrytpedKey:PrivateKey = await decryptKey({
                    privateKey:decryptionKey,
                    passphrase:privateKeyPassphrase
                });
                decryptionKey = decrytpedKey;
            }
        }

        const decryptedMessage = await decrypt({message:pgpMessage,decryptionKeys:decryptionKey});

        setDecryptedMessage(decryptedMessage.data);
        
    }


    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key" isVisible={isModalVisible} setPrivateKeyPassphrase={setPrivateKeyPassphrase} onConfirm={()=>{decryptMessage(encryptedMessage,privateKeyPassphrase)}} onClose={()=>{setPrivateKeyPassphrase("")}} />

            <h2 className="text-2xl font-bold mb-4 text-center">Decryption</h2>
            <div className="w-full flex flex-col">
                <label htmlFor="message" className="block text-sm font-medium">Encrypted message:</label>
                <textarea id="message"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={encryptedMessage} onChange={(e)=>{setEncryptedMessage(e.target.value)}}></textarea>
                <button 
                    className="mt-4 btn btn-info" onClick={()=>{decryptMessage(encryptedMessage)}}>Decrypt</button>
            </div>

            {
  (decryptedMessage === "") ? (
    null
  ) : (
   <OutputTextarea textValue={decryptedMessage}/>
  )
}
        </div>
    );
}