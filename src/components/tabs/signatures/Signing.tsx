import { RootState, useAppSelector } from "@src/redux/store";
import { CleartextMessage, PrivateKey, createCleartextMessage, readPrivateKey, sign } from "openpgp";
import React, { useEffect, useState } from "react";
import PassphraseModal from "../../PassphraseModal";
import OutputTextarea from "../../OutputTextarea";
import KeyDropdown from "../../keyDropdown";
import { CryptoKeys, sectionsPropsInterface } from "@src/types";
import { getPrivateKeysAndPasswords, updateIsKeyUnlocked } from "@src/utils";

export default function Signing({activeSection,setActiveSection}:sectionsPropsInterface) {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [message,setMessage] = useState<string>("");
    const [signedMessage,setSignedMessage] = useState<string>("");

    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);
    const [isSelectedPrivateKeyUnlocked,setIsSelectedPrivateKeyUnlocked] = useState<boolean>(false);
    
    useEffect(()=>{
        updateIsKeyUnlocked(selectedPrivKey,setIsSelectedPrivateKeyUnlocked);
    },[selectedPrivKey])

    const signMessage = async (signingKeys:CryptoKeys[])=>{
        if(message === ""){
            return;
            //show alert with info
        }

        if(signingKeys.length===0){
            return;
        }
        
        if(!signingKeys.every(e=>e.isUnlocked)){
            setIsModalVisible(true);
            return;
        }
        const {privateKeys} = await getPrivateKeysAndPasswords(signingKeys);
        const messageParsed:CleartextMessage|null = await createCleartextMessage({text:message}).catch(e => { console.error(e); return null });
        if(!messageParsed){
            console.log("Failed to generate parse message");
            return;
        }
        const signature:string|null = await sign({message:messageParsed,signingKeys:privateKeys}).catch(e => { console.error(e); return null });
        if(!signature){
            console.log("Failed to generate signature");
            return;
        }
        setSignedMessage(signature);
    }
    return (
    <div className="p-6">
        <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key:" isVisible={isModalVisible} dataToUnlock={[{data:selectedPrivKey,isPrivateKey:true,isUnlocked:isSelectedPrivateKeyUnlocked}]} setIsVisible={setIsModalVisible} onConfirm={signMessage} onClose={()=>{}} />
        <div className="w-full flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium">Message</label>
            <textarea id="message"
                className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={message} onChange={(e)=>{setMessage(e.target.value)}}></textarea>
                <KeyDropdown isActive={true} label="Sign with private key:" keysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
            <button 
                className="mt-4 btn btn-info" onClick={()=>signMessage([{data:selectedPrivKey,isPrivateKey:true,isUnlocked:isSelectedPrivateKeyUnlocked}])}>Sign message</button>
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