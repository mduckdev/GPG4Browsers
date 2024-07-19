import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import { addPrivateKey } from "@src/redux/privateKeySlice";
import {BasePacket, BaseSecretKeyPacket, Key,PrimaryUser,PrivateKey,readKey, readPrivateKey} from "openpgp"
import { addPublicKey } from "@src/redux/publicKeySlice";
export default function AddprivateKey({activeTab,setActiveTab}) {
    const dispatch = useAppDispatch();
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const [privateKeyName,setprivateKeyName] = useState<string>("");
    const [privateKeyValue,setprivateKeyValue] = useState<string>("");
    const [isValidPrivateKey,setIsValidPrivateKey] = useState<boolean>(false);
    const [isUniquePrivateKey,setIsUniquePrivateKey] = useState<boolean>(false);

    const validateprivateKey = async (privateKey:string) => {
        let key:Key = await readKey({ armoredKey: privateKey }).catch(e => { console.error(e); return null });
        if (!key || !key.isPrivate()) {
            return false;
        }
        return true;
        
    }
    const checkIsUniquePrivateKey = async (privateKey:string) => {
        const key:BaseSecretKeyPacket = await readKey({armoredKey:privateKey}).catch(e => { console.error(e); return null });
        if(!key){
            setIsValidPrivateKey(false);
            return false;
        }
        for (const privKey of privKeysList){
            let tempKey:BaseSecretKeyPacket = await readKey({armoredKey:privKey.privateKeyValue}).catch(e => { console.error(e); return null });
            if(key.hasSameFingerprintAs(tempKey)){
                console.log("Key already used")
                setIsUniquePrivateKey(false);
                return false
            }
        };
        setIsUniquePrivateKey(true);
        return true;
        
    }

    const saveToKeyring = async ()=>{
        const isValid = await validateprivateKey(privateKeyValue);
        if(!isValid){
            return false;
        }
        const isUnique = await checkIsUniquePrivateKey(privateKeyValue);
        if(!isUnique){
            return false;
        }

        const key:PrivateKey = await readPrivateKey({ armoredKey: privateKeyValue }).catch(e => { console.error(e); return null });
        const userID:PrimaryUser = await key.getPrimaryUser();
        const name:string = userID.user.userID.name;
        const email:string = userID.user.userID.email;

        const pubKeyFromPrivKey = key.toPublic();

        dispatch(addPrivateKey({privateKeyName:privateKeyName,privateKeyValue:privateKeyValue,userID:`${name?name:""} <${email}>`, fingerprint:key.getFingerprint()}));
        dispatch(addPublicKey({publicKeyName:privateKeyName,publicKeyValue:pubKeyFromPrivKey.armor(),userID:`${name?name:""} <${email}>`, fingerprint:key.getFingerprint()}));

        
        setActiveTab('encryption');
    }

    return (
    <div className="p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Add to keyring</h2>
        <label htmlFor="keyName" className="text-lg mb-2">Unique key name</label>
        <input required value={privateKeyName} onChange={(e)=>{setprivateKeyName(e.target.value)}} type="text" id="keyName" className="w-full border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 " />
        <label htmlFor="privateKey" className="text-lg mb-2">Private Key:</label>
        <textarea required value={privateKeyValue} onChange={(e)=>{setprivateKeyValue(e.target.value)}} id="privateKey" className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 "></textarea>
        <button id="saveButton" className="w-full btn btn-info mb-4" onClick={()=> saveToKeyring()}>Save</button>
        <button id="backButton" className="w-full btn mb-4" onClick={() => setActiveTab('encryption')}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
    </div>
    )
}