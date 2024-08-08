import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import { IPrivateKey, addPrivateKey, deletePrivateKey } from "@src/redux/privateKeySlice";
import {  Key,PrimaryUser,readKey} from "openpgp"
import { IPublicKey, addPublicKey, deletePublicKey } from "@src/redux/publicKeySlice";
import { sectionsWithPreviousInterface } from "@src/types";


export default function AddKey({activeSection,previousTab,setActiveSection}:sectionsWithPreviousInterface) {

    const dispatch = useAppDispatch();
    const privateKeysList:IPrivateKey[] = useAppSelector((state:RootState)=>state.privateKeys);
    const publicKeysList:IPublicKey[] = useAppSelector((state:RootState)=>state.publicKeys);


    const [keyValue,setKeyValue] = useState<string>("");
    const [isValidKey,setIsValidKey] = useState<boolean>(false);
    const [isUniqueKey,setIsUniqueKey] = useState<boolean>(false);

    const saveToKeyring = async (overwriteKey?:boolean)=>{
        const key:Key|null = await readKey({ armoredKey: keyValue }).catch(e => { console.error(e); return null });
        if(!key){
            setIsValidKey(false)
            return false;
        }
        let isUnique:boolean;
        const keyFingerprint = key.getFingerprint();
        isUnique =  (
            ((privateKeysList.filter(e=>e.fingerprint===keyFingerprint)).length===0) && 
            ((publicKeysList.filter(e=>e.fingerprint===keyFingerprint)).length===0)
        );
        if(!isUnique&&!overwriteKey){
            //show confirm modal
            return false;
        }
        const userID:PrimaryUser = await key.getPrimaryUser();
        const name:string = userID.user.userID?.name || "";
        const email:string = userID.user.userID?.email || "";
        const userIDString:string = userID.user.userID?.userID || "";
        if(key.isPrivate()){
            const pubKeyFromPrivKey = key.toPublic();
            dispatch(deletePublicKey(key.getFingerprint()));
            dispatch(deletePrivateKey(key.getFingerprint()));

            dispatch(addPrivateKey({keyValue:keyValue,userID:userIDString,name:name,email:email, fingerprint:keyFingerprint}));
            dispatch(addPublicKey({keyValue:pubKeyFromPrivKey.armor(),userID:userIDString,name:name,email:email, fingerprint:pubKeyFromPrivKey.getFingerprint()}));

            
        }else{
           
            dispatch(deletePublicKey(keyFingerprint));
            
            dispatch(addPublicKey({keyValue:keyValue, userID:userIDString,name:name,email:email, fingerprint:keyFingerprint}));
        }
        
        setActiveSection(previousTab);
    }

    return (
    <div className="p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Add to keyring</h2>
        <label htmlFor="keyValue" className="text-lg mb-2">Paste your armored key:</label>
        <textarea required value={keyValue} onChange={(e)=>{setKeyValue(e.target.value)}} id="keyValue" className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 "></textarea>
        <button id="saveButton" className="w-full btn btn-info mb-4" onClick={()=> saveToKeyring()}>Save</button>
        <button id="backButton" className="w-full btn mb-4" onClick={() => setActiveSection(previousTab)}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
    </div>
    )
}