import { useAppSelector } from "@src/redux/store";
import React, { useState } from "react";
import Decryption from "@src/components/tabs/encryptionAndDecryption/Decryption";
import { MainProps, sectionsWithPreviousInterface } from "@src/types";
import Encryption from "@src/components/tabs/encryptionAndDecryption/Encryption";
export default function EncryptionAndDecryption({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
     
    const [selectedTab,setSelectedTab]=useState("encryption");
    const renderComponent = () => {
        switch (selectedTab) {
            case 'encryption':
                return <Encryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection}/>;
            case 'Decryption':
                return <Decryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />
            default:
                return <Encryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
        }
      };
        return (
            <div>
                <div role="tablist" className="tabs tabs-lifted mt-4">
                    <a
                        role="tab"
                        className={`${selectedTab==="encryption"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("encryption")}
                    >
                        Encryption
                    </a>
                    <a
                        role="tab"
                        className={`${selectedTab==="Decryption"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("Decryption")}
                    
                    >
                        Decryption
                    </a>
                </div>
                <div className="container mx-auto mb-5 pt-8">
                {renderComponent()}
                </div>
            </div>
            
            
        );
}