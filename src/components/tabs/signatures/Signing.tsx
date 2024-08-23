import { RootState, useAppSelector } from "@src/redux/store";
import { CleartextMessage, PrivateKey, createCleartextMessage, readPrivateKey, sign } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "../../PassphraseModal";
import OutputTextarea from "../../OutputTextarea";
import KeyDropdown from "../../keyDropdown";
import { sectionsPropsInterface } from "@src/types";

export default function Signing({activeSection,setActiveSection}:sectionsPropsInterface) {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [message,setMessage] = useState<string>("");
    const [signedMessage,setSignedMessage] = useState<string>("");

    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);

    const signMessage = async (unlockedPrivateKey:PrivateKey|string)=>{
        if(message === ""){
            return;
            //show alert with info
        }

        let signKey:PrivateKey|null;
        if(unlockedPrivateKey instanceof PrivateKey){
            signKey=unlockedPrivateKey;
        }else{
          signKey = await readPrivateKey({armoredKey:selectedPrivKey}).catch(e => { console.error(e); return null });
        }
        
        if(!signKey){
            return;
        }
        if(!signKey.isDecrypted()){
            setIsModalVisible(true);
            return;
        }
        const messageParsed:CleartextMessage|null = await createCleartextMessage({text:message}).catch(e => { console.error(e); return null });
        if(!messageParsed){
            console.log("Failed to generate parse message");
            return;
        }
        const signature:string|null = await sign({message:messageParsed,signingKeys:signKey}).catch(e => { console.error(e); return null });
        if(!signature){
            console.log("Failed to generate signature");
            return;
        }
        setSignedMessage(signature);
    }
    return (
    <div className="p-6">
        <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key:" isVisible={isModalVisible} privateKeys={[selectedPrivKey]} setIsVisible={setIsModalVisible} onConfirm={signMessage} onClose={()=>{}} />

        <h2 className="text-2xl font-bold mb-4 text-center">Signatures</h2>
        <div className="w-full flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium">Message</label>
            <textarea id="message"
                className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={message} onChange={(e)=>{setMessage(e.target.value)}}></textarea>
                <KeyDropdown isActive={true} label="Sign with private key:" keysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
            <button 
                className="mt-4 btn btn-info" onClick={()=>signMessage(selectedPrivKey)}>Sign message</button>
        </div>
    {       
        (signedMessage === "") ? (
            null
        ) : (
            <OutputTextarea textValue={signedMessage}/>
        )
    }
    </div>
    )
}