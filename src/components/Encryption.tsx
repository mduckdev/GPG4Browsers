import { RootState, useAppSelector } from "@src/redux/store";
import { Key, MaybeArray, Message, PrivateKey, createMessage, decryptKey, encrypt, readKey, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "./PassphraseModal";
import OutputTextarea from "./OutputTextarea";
import KeyDropdown from "./keyDropdown";
import { sectionsWithPreviousInterface } from "@src/types";

export default function Encryption({activeSection,previousTab,setActiveSection}:sectionsWithPreviousInterface) {
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [selectedPubKey,setSelectedPubKey] =  useState<string>(pubKeysList[0]?.keyValue || "");
    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");

    const [message,setMessage] =  useState<string>("");
    const [encryptedMessage,setEncryptedMessage] =  useState<string>("");

    const [signMessage,setSignMessage] = useState<boolean>(true);
    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);

    const encryptMessage = async(privateKey?:string)=>{
        if(message==="" || selectedPubKey===""){
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


        const pgpMessage:Message<string> = await createMessage({ text: message });
        const response:string = await encrypt({
            message: pgpMessage,
            encryptionKeys: pgpKey,
            signingKeys: (signMessage ? [pgpSignKey] : null) as MaybeArray<PrivateKey> | undefined
        }).then((encrypted) => {
            return encrypted;
        }).catch(e => {console.error(e); return ""});

        setEncryptedMessage(response);
        return response;
    }

    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key" isVisible={isModalVisible} setIsVisible={setIsModalVisible} privateKey={selectedPrivKey} onConfirm={encryptMessage} onClose={()=>{}} />

            <h2 className="text-2xl font-bold mb-4 text-center">Encryption</h2>
            <div className={`flex flex-col ${encryptedMessage!==""?(''):'mb-8'}`}>
                <label htmlFor="message" className="block text-sm font-medium ">Message:</label>
                <textarea id="message"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" onChange={(e)=>{setMessage(e.target.value)}}></textarea>

                <div className="mt-3">
                    <KeyDropdown isActive={true} label="Recipient's public key:" privateKeysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />

                    <KeyDropdown isActive={signMessage} label="Sign with private key:" privateKeysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
                    
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
                
               
        </div>
    );
}