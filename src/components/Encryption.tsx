import { RootState, useAppSelector } from "@src/redux/store";
import { Key, MaybeArray, Message, PrivateKey, createMessage, decryptKey, encrypt, readKey, readPrivateKey } from "openpgp";
import React, { useState } from "react";
import PassphraseModal from "./PassphraseModal";
import OutputTextarea from "./OutputTextarea";
import KeyDropdown from "./keyDropdown";
import { MainProps } from "@src/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { handleDataLoaded } from "@src/utils";
import MessageEncryption from "./tabs/encryption/MessageEncryption";
import FilesEncryption from "./tabs/encryption/FilesEncryption";

export default function Encryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const [selectedTab,setSelectedTab]=useState("messageEncryption");
    const renderComponent = () => {
        switch (selectedTab) {
            case 'messageEncryption':
                return <MessageEncryption activeSection={activeSection} isPopup={isPopup} previousTab={previousTab} setActiveSection={setActiveSection} />;
            case 'filesEncryption':
                return <FilesEncryption activeSection={activeSection} isPopup={isPopup} previousTab={previousTab} setActiveSection={setActiveSection} />
            default:
                return <MessageEncryption  activeSection={activeSection} isPopup={isPopup} previousTab={previousTab} setActiveSection={setActiveSection}  />;
        }
      };
        return (
            <div>
                <div role="tablist" className="tabs tabs-lifted mt-4">
                    <a
                        role="tab"
                        className={`${selectedTab==="messageEncryption"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("messageEncryption")}
                    >
                        Message encryption
                    </a>
                    <a
                        role="tab"
                        className={`${selectedTab==="filesEncryption"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("filesEncryption")}
                    
                    >
                        Files encryption
                    </a>
                </div>
                {renderComponent()}
            </div>
        )
}