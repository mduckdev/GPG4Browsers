import { IPublicKey } from "@src/redux/publicKeySlice";
import { RootState, useAppSelector } from "@src/redux/store";
import { KeyDropdownProps } from "@src/types";
import { getDropdownText } from "@src/utils";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DropdownItem from "./DropdownItem";
import { IPrivateKey } from "@src/redux/privateKeySlice";

export default function KeyDropdown<T extends IPublicKey | IPrivateKey>({label,style,id,keysList,isActive,selectedKeys,setSelectedKeys,setActiveSection}:KeyDropdownProps<T>) {
    const { t } = useTranslation();
    const preferences = useAppSelector((state:RootState)=>state.preferences);

    const [isOpen,setIsOpen]=useState<boolean>(false);
    const [searchQuery,setSearchQuery]=useState<string>("");
    const [dropdownText,setDropdownText]=useState<string>(getDropdownText(keysList,preferences, t("selectKey")));
    const ref = useRef<HTMLDivElement | null>(null);



    const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

    useEffect(()=>{
        // let areDefaultKeysAvailable:T[]|undefined=keysList.filter(e=>preferences.defaultSigningKeyFingerprints.includes(e.fingerprint));
        // if(areDefaultKeysAvailable){
        //     setSelectedKeys(areDefaultKeysAvailable);
        // }
        document.addEventListener("click", handleClickOutside);
        return () => {
          document.removeEventListener("click", handleClickOutside);
        };
    },[])

    useEffect(()=>{
        setSearchQuery("");
    },[isOpen])

    return (
    <div className={style} data-testid={`${id}Dropdown`}>
        <label htmlFor="keys" className="block text-sm font-medium mt-3" >{label}</label>
        <div className="flex gap-2">
            <div className="flex basis-5/6 min-w-0" ref={ref}>
                <div className={`w-full relative group ${!isActive?('line-through opacity-50'):('')}`}>
                    <button id="dropdown-button" className={`flex justify-start w-full max-h-10 px-4 py-2 text-sm font-medium t rounded-md shadow-sm focus:outline-none border-slate-500 border ${!isActive?('cursor-not-allowed'):('')}`} onClick={()=>{setIsOpen(!isOpen)}}>
                        <span className={`mr-2 basis-11/12 text-left truncate`}>{dropdownText}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 -mr-1 basis-1/12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {
                        (isOpen && isActive)?(
                            <div id="dropdown-menu" onBlur={()=>setIsOpen(false)}  className="w-full absolute right-0 bg-slate-100 dark:bg-gray-700 rounded-md shadow-lg p-1 space-y-1 z-50 overflow-auto max-h-36">
                                <input id="search-input" className="block w-full px-4 py-2 border rounded-md  focus:outline-none" type="text" placeholder="Search items" autoComplete="off" value={searchQuery} onChange={(e)=>{setSearchQuery(e.target.value)}}/>
                                {
                                    keysList.map( (element:IPublicKey,index:number)=>{
                                        if(element.userID.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            element.fingerprint.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            searchQuery === ""){
                                                return <DropdownItem key={index} keyData={element} selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} isCheckedDefault={selectedKeys.find(e=>e.fingerprint===element.fingerprint)?true:false} setDropdownText={setDropdownText} />
                                        }else{
                                            return null;
                                        }
                                    })
                                }
                                </div>
                        ):(null)
                    }
                   
                </div>
            </div>
        <button id={`Add${id}`} className="bg-green-500 hover:bg-green-600 text-white font-bold rounded basis-1/6" onClick={()=>setActiveSection('AddKey')}>+</button>
        </div>
        
    </div>
    )
}