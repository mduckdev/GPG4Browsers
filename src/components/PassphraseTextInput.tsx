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
          <button type="button" className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer" onClick={()=>{setShowPassword(!showPassword)}}>
            {
                showPassword?(
                    <FontAwesomeIcon icon={faEyeSlash} />

                ):(
                    
                    <FontAwesomeIcon icon={faEye} />
                )
            }
          </button>
        </div>
      </div>
    )
}