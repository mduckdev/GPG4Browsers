import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import { addPublicKey } from "@src/redux/publicKeySlice";
import {readKey,Key,PrimaryUser, BasePublicKeyPacket} from "openpgp"
export default function AddPublicKey({activeTab,setActiveTab}) {
    const dispatch = useAppDispatch();
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const [publicKeyName,setPublicKeyName] = useState<string>("");
    const [publicKeyValue,setPublicKeyValue] = useState<string>("");
    const [isValidPublicKey,setIsValidPublicKey] = useState<boolean>(false);
    const [isUniquePublicKey,setIsUniquePublicKey] = useState<boolean>(false);

    const validatePublicKey = async (publicKey:string) => {
        const key:Key = await readKey({armoredKey:publicKey}).catch(e => { console.error(e); return null });
        if(key && !key?.isPrivate()){
            setIsValidPublicKey(true);
            return true;
        }else{
            setIsValidPublicKey(false);
            return false;
        }
    }
    const checkIsUniquePublicKey = async (publicKey:string) => {
        const key:BasePublicKeyPacket = await readKey({armoredKey:publicKey}).catch(e => { console.error(e); return null });
        if(!key){
            setIsValidPublicKey(false);
            return false;
        }
        for (const pubKey of pubKeysList){
            let tempKey:BasePublicKeyPacket = await readKey({armoredKey:pubKey.publicKeyValue}).catch(e => { console.error(e); return null });
            if(key.hasSameFingerprintAs(tempKey)){
                console.log("Key already used")
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

        let key:Key = await readKey({ armoredKey: publicKeyValue }).catch(e => { console.error(e); return null });
        let userID:PrimaryUser = await key.getPrimaryUser();
        let name:string = userID.user.userID.name;
        let email:string = userID.user.userID.email;


        dispatch(addPublicKey({publicKeyName:publicKeyName,publicKeyValue:publicKeyValue,userID:`${name?name:""} <${email}>`,fingerprint:key.getFingerprint()}));
        setActiveTab('encryption');

    }

    return (
    <div className="p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Add to keyring</h2>
        <label htmlFor="keyName" className="text-lg mb-2">Unique key name</label>
        <input required value={publicKeyName} onChange={(e)=>{setPublicKeyName(e.target.value)}} type="text" id="keyName" className="w-full border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 " />
        <label htmlFor="publicKey" className="text-lg mb-2">Public Key:</label>
        <textarea required value={publicKeyValue} onChange={(e)=>{setPublicKeyValue(e.target.value)}} id="publicKey" className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 "></textarea>
        <button id="saveButton" className="w-full btn btn-info mb-4" onClick={()=> saveToKeyring()}>Save</button>
        <button id="backButton" className="w-full btn mb-4" onClick={() => setActiveTab('encryption')}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
    </div>
    )
}