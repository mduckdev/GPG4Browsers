import { RootState, useAppSelector } from "@src/redux/store";
import { Key, Message, PrivateKey, createMessage, decryptKey, encrypt, readKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "./PassphraseModal";
import OutputTextarea from "./OutputTextarea";

export default function Encryption({activeTab,previousTab,setActiveTab}) {
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [selectedPubKey,setSelectedPubKey] =  useState<string>(pubKeysList[0]?.keyValue || "");
    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(privKeysList[0]?.keyValue || "");
    const [privateKeyPassphrase,setPrivateKeyPassphrase] =  useState<string>("");

    const [message,setMessage] =  useState<string>("");
    const [encryptedMessage,setEncryptedMessage] =  useState<string>("");

    const [signMessage,setSignMessage] = useState<boolean>(true);
    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);

    const encryptMessage = async(message:string,publicKey:string, privateKey?:string,passphrase?:string)=>{
        if(message==="" || publicKey===""){
            return;
        }
        const pgpKey:Key = await readKey({armoredKey:publicKey}).catch(e => { console.error(e); return null });
        let pgpSignKey:PrivateKey = await readKey({armoredKey:privateKey}).catch(e => { console.error(e); return null });
        
        if(pgpSignKey && !pgpSignKey?.isDecrypted()){
            if(privateKeyPassphrase===""){
                setIsModalVisible(true);
                return;
            }
            
            const decrytpedKey:PrivateKey = await decryptKey({
                privateKey:pgpSignKey,
                passphrase:passphrase
            });
            pgpSignKey = decrytpedKey;
        }


        const pgpMessage:Message<string> = await createMessage({ text: message });
        const response = await encrypt({
            message: pgpMessage,
            encryptionKeys: pgpKey,
            signingKeys: pgpSignKey
        }).then((encrypted) => {
            return encrypted;
        }).catch(e => {console.error(e); return ""});

        setEncryptedMessage(response);
        return response;
    }

    return (
        <div className="p-6">
            <PassphraseModal title="Unlock private key" text="Enter your passphrase to unlock your private key" isVisible={isModalVisible} setPrivateKeyPassphrase={setPrivateKeyPassphrase} onConfirm={()=>{encryptMessage(message,selectedPubKey,selectedPrivKey,privateKeyPassphrase)}} onClose={()=>{setPrivateKeyPassphrase("");setIsModalVisible(false)}} />

            <h2 className="text-2xl font-bold mb-4 text-center">Encryption</h2>
            <div className={`flex flex-col ${encryptedMessage!==""?(''):'mb-8'}`}>
                <label htmlFor="message" className="block text-sm font-medium ">Message:</label>
                <textarea id="message"
                    className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" onChange={(e)=>{setMessage(e.target.value)}}></textarea>

                <div className="mt-3">
                    <label id="publicKeysLabel" htmlFor="keys" className="block text-sm font-medium ">Select the
                        recipient's
                        public key:</label>

                    <div className="flex gap-2">
                        <select id="publicKeysDropdown" name="keys" onChange={(e)=>{setSelectedPubKey(e.target.value)}}
                            className="mt-1 w-full py-2 px-3 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 basis-5/6">
                                {
                                    pubKeysList.map(element=>{
                                        return <option value={element.keyValue} key={element.keyValue}>{element.userID} </option>
                                    })
                                }
                        </select>
                        <button id="newPublicKey"
                            className="mt-1 w-full bg-green-500 hover:bg-green-600 text-white font-bold rounded basis-1/6" onClick={()=>setActiveTab('addKey')}>+</button>
                    </div>

                    {
                        signMessage?(
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
                        ):(null)
                    }
                    

                    <label className="cursor-pointer label pb-0">
                        <input id="signMessageToggle" type="checkbox" className="toggle toggle-success"
                            defaultChecked={signMessage} onChange={(e)=>{setSignMessage(e.target.checked);}}/>
                        <span className="label-text pl-3">Sign the message</span>
                    </label>
                </div>
                <button id="encryptBtn"
                    className="btn btn-info mt-2" onClick={()=>encryptMessage(message,selectedPubKey,selectedPrivKey)}>Encrypt</button>
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