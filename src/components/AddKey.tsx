import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import { IPrivateKey, addPrivateKey, deletePrivateKey } from "@src/redux/privateKeySlice";
import { BasePublicKeyPacket, BaseSecretKeyPacket, Key,PrimaryUser,readKey, readPrivateKey} from "openpgp"
import { IPublicKey, addPublicKey, deletePublicKey } from "@src/redux/publicKeySlice";

export default function AddKey({activeTab,previousTab,setActiveTab}) {

    const dispatch = useAppDispatch();
    const privateKeysList:IPrivateKey[] = useAppSelector((state:RootState)=>state.privateKeys);
    const publicKeysList:IPublicKey[] = useAppSelector((state:RootState)=>state.publicKeys);


    const [keyValue,setKeyValue] = useState<string>("");
    const [isValidKey,setIsValidKey] = useState<boolean>(false);
    const [isUniqueKey,setIsUniqueKey] = useState<boolean>(false);

    const checkIsUniquePrivateKey = async (key:BaseSecretKeyPacket) => {
        for (const tempKey of privateKeysList){
            let tempKeyParsed:BaseSecretKeyPacket = await readPrivateKey({armoredKey:tempKey.keyValue}).catch(e => { console.error(e); return null });
            if(key.hasSameFingerprintAs(tempKeyParsed)){
                console.log("Key already used")
                setIsUniqueKey(false);
                return false
            }
        };
        setIsUniqueKey(true);
        return true;
    }

    const checkIsUniquePublicKey = async (key:BasePublicKeyPacket) => {
        for (const tempKey of publicKeysList){
            let tempKeyParsed:BasePublicKeyPacket = await readKey({armoredKey:tempKey.keyValue}).catch(e => { console.error(e); return null });
            if(key.hasSameFingerprintAs(tempKeyParsed)){
                console.log("Key already used")
                setIsUniqueKey(false);
                return false
            }
        };
        setIsUniqueKey(true);
        return true;
    }

    const saveToKeyring = async (overwriteKey?:boolean)=>{
        const key:Key = await readKey({ armoredKey: keyValue }).catch(e => { console.error(e); return null });
        if(!key){
            setIsValidKey(false)
            return false;
        }
        
        if(key.isPrivate()){
            const privateKey:BaseSecretKeyPacket = await readPrivateKey({ armoredKey: keyValue }).catch(e => { console.error(e); return null });
            const privateKeyFingerprint = privateKey.getFingerprint();
            const isUnique =  (
                ((privateKeysList.filter(e=>e.fingerprint===privateKeyFingerprint)).length===0) && 
                ((publicKeysList.filter(e=>e.fingerprint===privateKeyFingerprint)).length===0)
            );
            if(!isUnique&&!overwriteKey){
                //show confirm modal
                return false;
            }

            const userID:PrimaryUser = await key.getPrimaryUser();
            const name:string = userID.user.userID.name;
            const email:string = userID.user.userID.email;
            
            const pubKeyFromPrivKey = key.toPublic();
            
            dispatch(deletePublicKey(key.getFingerprint()));
            dispatch(deletePrivateKey(key.getFingerprint()));

            dispatch(addPrivateKey({keyValue:keyValue,userID:`${name?name:""} <${email}>`, fingerprint:key.getFingerprint()}));
            dispatch(addPublicKey({keyValue:pubKeyFromPrivKey.armor(),userID:`${name?name:""} <${email}>`, fingerprint:pubKeyFromPrivKey.getFingerprint()}));

            
        }else{
            const publicKey:BasePublicKeyPacket = await readKey({ armoredKey: keyValue }).catch(e => { console.error(e); return null });
            const publicKeyFingerprint:string = publicKey.getFingerprint();
            const isUnique:boolean = (publicKeysList.filter(e=>e.fingerprint===publicKeyFingerprint)).length===0;
            if(!isUnique&&!overwriteKey){
                //show confirm modal
                return false;
            }

            const userID:PrimaryUser = await key.getPrimaryUser();
            const name:string = userID.user.userID.name;
            const email:string = userID.user.userID.email;

            dispatch(deletePublicKey(publicKeyFingerprint));
            
            dispatch(addPublicKey({keyValue:keyValue, userID:`${name?name:""} <${email}>`, fingerprint:publicKeyFingerprint}));
        }
        
        setActiveTab('encryption');
    }

    return (
    <div className="p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Add to keyring</h2>
        <label htmlFor="keyValue" className="text-lg mb-2">Paste your armored key:</label>
        <textarea required value={keyValue} onChange={(e)=>{setKeyValue(e.target.value)}} id="keyValue" className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 "></textarea>
        <button id="saveButton" className="w-full btn btn-info mb-4" onClick={()=> saveToKeyring()}>Save</button>
        <button id="backButton" className="w-full btn mb-4" onClick={() => setActiveTab(previousTab)}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
    </div>
    )
}