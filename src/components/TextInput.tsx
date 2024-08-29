import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PassphraseTextInputProps, TextInputProps } from "@src/types";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
export default function TextInput({value,setOnChange,icon,placeholder,labelText}:TextInputProps) {
  const { t } = useTranslation();

return(
    <div className="max-w-sm my-3">
        <label  className="block text-sm font-medium" >{labelText}</label>

        <div className="relative">
          <input id="hs-toggle-password" type="text" value={value} onChange={(e)=>setOnChange(e.target.value)} className="w-full border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 pl-8" placeholder={placeholder} />
            <FontAwesomeIcon className="absolute inset-y-3 start-0 z-20 px-3" icon={icon} />
          
        </div>
      </div>
)
}