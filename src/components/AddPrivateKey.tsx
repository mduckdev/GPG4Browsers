import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import { addPrivateKey } from "@src/redux/privateKeySlice";
import Browser from "webextension-polyfill";
import * as openpgp from "openpgp"
export default function AddprivateKey({activeTab,setActiveTab}) {
    const dispatch = useAppDispatch();
    const privKeysList = useAppSelector((state:RootState)=>state.privateKey);
    const [privateKeyName,setprivateKeyName] = useState<string>("");
    const [privateKeyValue,setprivateKeyValue] = useState<string>("");
    const [isValidprivateKey,setIsValidprivateKey] = useState<boolean>(false);
    const [isUniqueprivateKey,setIsUniqueprivateKey] = useState<boolean>(false);

    const validateprivateKey = async (privateKey:string) => {
        
    }
    const checkIsUniqueprivateKey = async (privateKey:string) => {
        
        
    }

    const saveToKeyring = async ()=>{
        

    }

    return (
    <div className="p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Add to keyring</h2>
        <label htmlFor="keyName" className="text-lg mb-2">Unique key name</label>
        <input required value={privateKeyName} onChange={(e)=>{setprivateKeyName(e.target.value)}} type="text" id="keyName" className="w-full border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 " />
        <label htmlFor="privateKey" className="text-lg mb-2">Private Key:</label>
        <textarea required value={privateKeyValue} onChange={(e)=>{setprivateKeyValue(e.target.value)}} id="privateKey" className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 "></textarea>
        <button id="saveButton" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4" onClick={()=> saveToKeyring()}>Save</button>
        <button id="backButton" className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mb-4" onClick={() => setActiveTab('encryption')}><FontAwesomeIcon icon={faArrowLeft} /> Back</button>
    </div>
    )
}