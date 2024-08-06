import { RootState, useAppSelector } from "@src/redux/store";
import { CleartextMessage, Message, PrivateKey, createCleartextMessage, createMessage, decryptKey, readPrivateKey, sign } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "../PassphraseModal";
import OutputTextarea from "../OutputTextarea";
export default function Signing({activeTab,setActiveTab}) {
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [message,setMessage] = useState<string>("");
    const [signedMessage,setSignedMessage] = useState<string>("");

    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");
    const [privateKeyPassphrase,setPrivateKeyPassphrase] =  useState<string>("");

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);

    const signMessage = async ()=>{
        let signKey:PrivateKey = await readPrivateKey({armoredKey:selectedPrivKey}).catch(e => { console.error(e); return null });
        
        if(!signKey){
            return;
        }
        if(!signKey.isDecrypted()){
            if(privateKeyPassphrase===""){
                setIsModalVisible(true);
                return;
            }else{
                const decrytpedKey:PrivateKey = await decryptKey({
                    privateKey:signKey,
                    passphrase:privateKeyPassphrase
                });
                signKey = decrytpedKey;
            }
        }
        const messageParsed:Message<string> = await createCleartextMessage({text:message}).catch(e => { console.error(e); return null });

        const signature:string = await sign({message:messageParsed,signingKeys:signKey}).catch(e => { console.error(e); return null });
        
        setPrivateKeyPassphrase("");
        setSignedMessage(signature);
    }
    return (
    <div className="p-6">
        <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key" isVisible={isModalVisible} setPrivateKeyPassphrase={setPrivateKeyPassphrase} onConfirm={()=>{signMessage()}} onClose={()=>{setPrivateKeyPassphrase("");setIsModalVisible(false)}} />

        <h2 className="text-2xl font-bold mb-4 text-center">Signatures</h2>
        <div className="w-full flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium">Message</label>
            <textarea id="message"
                className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={message} onChange={(e)=>{setMessage(e.target.value)}}></textarea>
                <div className="privateKeys">
                            <label id="privateKeysLabel" htmlFor="keys" className="block text-sm font-medium  pt-3" >Sign with
                                private key:</label>
                            <div className="flex gap-2">
                                <select id="privateKeysDropdown" name="keys" onChange={(e)=>{setSelectedPrivKey(e.target.value)}}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 basis-5/6">
                                        {
                                            privKeysList.map(element=>{
                                                return <option value={element.keyValue} key={element.keyValue}>{element.userID}</option>
                                            })
                                        }   
                                </select>
                                <button id="newPrivateKey"
                                    className="mt-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded basis-1/6" onClick={()=>setActiveTab('addKey')}>+</button>
                            </div>
                        </div>
            <button 
                className="mt-4 btn btn-info" onClick={signMessage}>Sign message</button>
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