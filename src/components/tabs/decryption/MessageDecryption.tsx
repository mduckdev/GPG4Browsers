import { RootState, useAppSelector } from "@src/redux/store";
import {  DecryptMessageResult, Key, KeyID, Message, PrivateKey, Subkey, decrypt, readKey, readMessage, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "@src/components/PassphraseModal";

import OutputTextarea from "@src/components/OutputTextarea";
export default function MessageDecryption() {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const [decryptionKeys,setDecryptionKeys] = useState<string[]>([]);
    
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
                        setDecryptionKeys([...decryptionKeys,privKey.armor()]);
                        return privKey;
                    }
                }
            }
        }
        return false;
    }

    const decryptMessage = async (privateKeys?:PrivateKey[])=>{
        
        if(encryptedMessage===""){
            return;
        }
        const pgpMessage:Message<string>|null = await readMessage({armoredMessage:encryptedMessage}).catch(e => { console.error(e); return null });

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
            console.log(areAllPrivateKeysDecrypted,decryptionKeys)
            if(!areAllPrivateKeysDecrypted || !decryptionKeys){
                    setIsModalVisible(true);
                    return;
            }
        }
        

        const decryptedMessage:DecryptMessageResult|null = await decrypt({message:pgpMessage,decryptionKeys:privateKeys,verificationKeys:pubKeys}).catch(e => { console.error(e); return null });

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
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key:" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKeys={decryptionKeys} onConfirm={decryptMessage} onClose={()=>{}} />

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