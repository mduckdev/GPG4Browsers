import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PassphraseTextInputProps, TextInputProps } from "@src/types";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
export default function TextInput({value,setOnChange,icon,placeholder,labelText,className}:TextInputProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement|null>(null)
  useEffect(()=>{
    if(ref.current){
      ref.current.setAttribute('size', ref.current.getAttribute('placeholder')?.length.toString() || "inset");
    }
  },[])
return(
    <div className={`my-3 ${className}`}>
        <label  className="block text-sm font-medium" >{labelText}</label>

        <div className="relative">
          <input ref={ref} id="hs-toggle-password" type="text" value={value} onChange={(e)=>setOnChange(e.target.value)} className="w-full border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 pl-8" placeholder={placeholder} />
            <FontAwesomeIcon className="absolute inset-y-3 start-0 z-20 px-3" icon={icon} />
          
        </div>
      </div>
)
}