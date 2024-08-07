import { IPrivateKey } from "@src/redux/privateKeySlice";
import { IPublicKey } from "@src/redux/publicKeySlice";
import React from "react";
interface KeyDropdownProps{
    label:string,
    privateKeysList:IPublicKey[]|IPrivateKey[],
    setSelectedKey:Function,
    setActiveSection:Function
}
export default function KeyDropdown({label,privateKeysList,setSelectedKey,setActiveSection}:KeyDropdownProps) {
    return (
    <div>
        <label id="privateKeysLabel" htmlFor="keys" className="block text-sm font-medium  pt-3" >{label}</label>
        <div className="flex gap-2">
            <select id="privateKeysDropdown" name="keys" onChange={(e)=>{setSelectedKey(e.target.value)}}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 basis-5/6">
                    {
                        privateKeysList.map(element=>{
                            return <option value={element.keyValue} key={element.keyValue}>{element.userID}</option>
                        })
                    }   
            </select>
            <button id="newPrivateKey"
                className="mt-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded basis-1/6" onClick={()=>setActiveSection('addKey')}>+</button>
        </div>
    </div>
    )
}