import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import { addPublicKey } from "@src/redux/publicKeySlice";
import Browser from "webextension-polyfill";
import * as openpgp from "openpgp"
export default function AddPublicKey({activeTab,setActiveTab}) {
    const dispatch = useAppDispatch();
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKey);
    const [publicKeyName,setPublicKeyName] = useState<string>("");
    const [publicKeyValue,setPublicKeyValue] = useState<string>("");
    const [isValidPublicKey,setIsValidPublicKey] = useState<boolean>(false);
    const [isUniquePublicKey,setIsUniquePublicKey] = useState<boolean>(false);

    const validatePublicKey = async (publicKey:string) => {
        let isValidKey = await Browser.runtime.sendMessage({action:"validate-pubkey",publicKey:publicKey}).catch(e=>{console.error(e);})
        if(isValidKey){
            setIsValidPublicKey(true);
            return true;
        }else{
            setIsValidPublicKey(false);
            return false;
        }
    }
    const checkIsUniquePublicKey = async (publicKey:string) => {
        let fingerprint:string = await Browser.runtime.sendMessage({action:"get-key-info",publicKey:publicKey}).catch(e=>{console.error(e);})
        for (const pubKey of pubKeysList){
            let tempFingerprint:string = await Browser.runtime.sendMessage({action:"get-key-info",publicKey:pubKey.publicKeyValue}).catch(e=>{console.error(e);})
            if(tempFingerprint===fingerprint){
                setIsUniquePublicKey(false);
                return false
            }
        };
        setIsUniquePublicKey(true);
        return true;
        
    }

    const saveToKeyring = async ()=>{
        let isValid = await validatePublicKey(publicKeyValue);
        if(!isValid){
            return;
        }
        let isUnique = await checkIsUniquePublicKey(publicKeyValue);
        if(!isUnique){
            return;
        }

        let key:openpgp.Key = await openpgp.readKey({ armoredKey: publicKeyValue }).catch(e => { console.error(e); return null });
        let userID:openpgp.PrimaryUser = await key.getPrimaryUser();
        let name:string = userID.user.userID.name;
        let email:string = userID.user.userID.email;


        dispatch(addPublicKey({publicKeyName:publicKeyName,publicKeyValue:publicKeyValue,userID:`${name?name:""} <${email}>`}));
        setActiveTab('encryption');

    }

    return (
    <div className="p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Add to keyring</h2>
        <label htmlFor="keyName" className="text-lg mb-2">Unique key name</label>
        <input required value={publicKeyName} onChange={(e)=>{setPublicKeyName(e.target.value)}} type="text" id="keyName" className="w-full border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 " />
        <label htmlFor="publicKey" className="text-lg mb-2">Public Key:</label>
        <textarea required value={publicKeyValue} onChange={(e)=>{setPublicKeyValue(e.target.value)}} id="publicKey" className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 "></textarea>
        <button id="saveButton" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4" onClick={()=> saveToKeyring()}>Save</button>
        <button id="backButton" className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-4" onClick={() => setActiveTab('encryption')}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
    </div>
    )
}