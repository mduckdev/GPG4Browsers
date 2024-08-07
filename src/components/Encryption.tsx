import { RootState, useAppSelector } from "@src/redux/store";
import { Key, Message, PrivateKey, createMessage, decryptKey, encrypt, readKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "./PassphraseModal";
import OutputTextarea from "./OutputTextarea";
import KeyDropdown from "./keyDropdown";

export default function Encryption({activeSection,previousTab,setActiveSection}) {
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
        const pgpKey:Key = await readKey({armoredKey:selectedPubKey}).catch(e => { console.error(e); return null });
        let pgpSignKey:PrivateKey = (await readKey({armoredKey:privateKey}).catch(e => { console.error(e); return null }));
        
        if(pgpSignKey && !pgpSignKey?.isDecrypted() && signMessage){
            setIsModalVisible(true);
            return;
        }


        const pgpMessage:Message<string> = await createMessage({ text: message });
        const response = await encrypt({
            message: pgpMessage,
            encryptionKeys: pgpKey,
            signingKeys: signMessage?(pgpSignKey):([])
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
                    <KeyDropdown label="Select recipient's public key:" privateKeysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
                    
                    {
                        signMessage?(
                            <KeyDropdown label="Sign with private key:" privateKeysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
                        ):(null)
                    }
                    

                    <label className="cursor-pointer label pb-0">
                        <input id="signMessageToggle" type="checkbox" className="toggle toggle-success"
                            defaultChecked={signMessage} onChange={(e)=>{setSignMessage(e.target.checked);}}/>
                        <span className="label-text pl-3">Sign the message</span>
                    </label>
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