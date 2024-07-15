import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RootState, useAppSelector } from "@src/redux/store";
import { Key, Message, createMessage, encrypt, readKey } from "openpgp";
import React, { useState } from "react";

export default function Encryption({activeTab,setActiveTab}) {
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKey);

    const [signMessage,setSignMessage] = useState<boolean>(true);
    const [selectedPubKey,setSelectedPubKey] =  useState<string>(pubKeysList[0]?.publicKeyValue || "");
    const [message,setMessage] =  useState<string>("");
    const [encryptedMessage,setEncryptedMessage] =  useState<string>("");
    const [showClipboardIcon,setShowClipboardIcon] = useState<boolean>(false);
    const [showSuccessIcon,setshowSuccessIcon] = useState<boolean>(false);

    const encryptMessage = async(message:string,publicKey:string)=>{
        if(message==="" || publicKey===""){
            return "";
        }
        const pgpKey:Key = await readKey({armoredKey:publicKey}).catch(e => { console.error(e); return null });
        const pgpMessage:Message<string> = await createMessage({ text: message });
        const response = await encrypt({
            message: pgpMessage,
            encryptionKeys: pgpKey,
        }).then((encrypted) => {
            return encrypted;
        }).catch(e => {console.error(e); return ""});

        setEncryptedMessage(response);
        return response;
    }

    return (
        <div className="p-6">
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
                                        return <option value={element.publicKeyValue} key={element.publicKeyName}>{element.publicKeyName} | {element.userID}</option>
                                    })
                                }
                        </select>
                        <button id="newPublicKey"
                            className="mt-1 w-full bg-green-500 hover:bg-green-600 text-white font-bold rounded basis-1/6" onClick={()=>setActiveTab('addPublicKey')}>+</button>
                    </div>

                    {
                        signMessage?(
                        <div className="privateKeys">
                            <label id="privateKeysLabel" htmlFor="keys" className="block text-sm font-medium  pt-3" >Sign with
                                private key:</label>
                            <div className="flex gap-2">
                                <select id="privateKeysDropdown" name="keys"
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 basis-5/6">
                                </select>
                                <button id="newPrivateKey"
                                    className="mt-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded basis-1/6" onClick={()=>setActiveTab('addPrivateKey')}>+</button>
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
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={()=>encryptMessage(message,selectedPubKey)}>Encrypt</button>
            </div>

{
  (encryptedMessage === "") ? (
    null
  ) : (
    <div className="mt-4 mb-8 relative" id="encryptedMessage" 
    onMouseOver={() => { setShowClipboardIcon(true) }}
    onMouseLeave={() => { setShowClipboardIcon(false); setshowSuccessIcon(false) }}>
        {
            showClipboardIcon?(<div id="button-wrapper" className="absolute inset-y-1/2 inset-x-1/2 z-10 blur-none">
                <button
                className="text-white focus:outline-none h-full flex items-center justify-center"
                >
                <FontAwesomeIcon icon={faCopy} size="2x" />
            </button>
            </div>):(null)
        }
        {
            showSuccessIcon?(<div id="button-wrapper" className="absolute inset-y-1/2 inset-x-1/2 z-10 blur-none">
                <button
                className="text-white focus:outline-none h-full flex items-center justify-center"
                >
                <FontAwesomeIcon icon={faCheck} size="2x" color="green" />
            </button>
            </div>):(null)
        }


      <textarea
        className={`w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-green-500 p-2 rounded-md hover:cursor-pointer ${(showClipboardIcon || showSuccessIcon)?('blur-[1px]'):('')}`}
        value={encryptedMessage}
        contentEditable={false}
        readOnly={true}
        onClick={() => { navigator.clipboard.writeText(encryptedMessage);setShowClipboardIcon(false);setshowSuccessIcon(true) }}
        
      >
      </textarea>
    </div>
  )
}
                
               
        </div>
    );
}