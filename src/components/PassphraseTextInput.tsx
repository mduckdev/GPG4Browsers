import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PassphraseTextInputProps } from "@src/types";
import React, { useState } from "react";
export default function PassphraseTextInput({value,setOnChange}:PassphraseTextInputProps) {
    const [showPassword,setShowPassword] = useState<boolean>(false);

    return (
        <div className="max-w-sm">
        <label  className="block text-sm font-medium mt-3" >Password</label>

        <div className="relative">
          <input id="hs-toggle-password" type={showPassword?"text":"password"} value={value} onChange={(e)=>setOnChange(e.target.value)} className="w-full border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4" placeholder="Enter password" />
          <label className="swap absolute inset-y-0 end-0 z-20 px-3 cursor-pointer">
            <input type="checkbox" onChange={(e)=>setShowPassword(e.target.checked)}/>
              <FontAwesomeIcon className="swap-on" icon={faEyeSlash} />
              <FontAwesomeIcon className="swap-off" icon={faEye} />
          </label>
          
        </div>
      </div>
    )
}