import React, { useState } from "react";
import { DecryptionProps } from "@src/types";
import MessageDecryption from "./tabs/decryption/MessageDecryption";
import FilesDecryption from "./tabs/decryption/FilesDecryption";
export default function Decryption({isPopup}:DecryptionProps) {
    
    const [selectedTab,setSelectedTab]=useState("messageDecryption");
    const renderComponent = () => {
        switch (selectedTab) {
            case 'messageDecryption':
                return <MessageDecryption />;
            case 'filesDecryption':
                return <FilesDecryption />
            default:
                return <MessageDecryption  />;
        }
      };
        return (
            <div>
                <div role="tablist" className="tabs tabs-lifted mt-4">
                    <a
                        role="tab"
                        className={`${selectedTab==="messageDecryption"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("messageDecryption")}
                    >
                        Message decryption
                    </a>
                    <a
                        role="tab"
                        className={`${selectedTab==="filesDecryption"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("filesDecryption")}
                    
                    >
                        Files decryption
                    </a>
                </div>
                {renderComponent()}
            </div>
        )
            
}