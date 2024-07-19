import React, { useState } from "react";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function OutputTextarea({textValue}) {
    const [showClipboardIcon,setShowClipboardIcon] = useState<boolean>(false);
    const [showSuccessIcon,setshowSuccessIcon] = useState<boolean>(false);
    return (
        <div className="mt-4 mb-8 relative"
        onMouseOver={() => { setShowClipboardIcon(true);setshowSuccessIcon(false) }}
        onMouseLeave={() => { setShowClipboardIcon(false); setshowSuccessIcon(false) }}
        onClick={() => { navigator.clipboard.writeText(textValue);setShowClipboardIcon(false);setshowSuccessIcon(true) }}
        
        >
            {
                showClipboardIcon?(<div id="button-wrapper" className="absolute inset-y-1/2 inset-x-1/2 z-10 blur-none" >
                    <button
                    className="text-white focus:outline-none h-full flex items-center justify-center"
                    >
                    <FontAwesomeIcon icon={faCopy} size="2x" />
                </button>
                </div>):(null)
            }
            {
                showSuccessIcon?(<div id="button-wrapper" className="absolute inset-y-1/2 inset-x-1/2 z-10 blur-none">
                    <button
                    className="text-white focus:outline-none h-full flex items-center justify-center"
                    >
                    <FontAwesomeIcon icon={faCheck} size="2x" color="green" />
                </button>
                </div>):(null)
            }
    
    
          <textarea
            className={`w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-green-500 p-2 rounded-md hover:cursor-pointer ${(showClipboardIcon || showSuccessIcon)?('blur-[1px]'):('')}`}
            value={textValue}
            contentEditable={false}
            readOnly={true}
          >
          </textarea>
        </div>
    )
}