import React, { useEffect, useState } from "react";
import Decryption from "@src/components/tabs/encryptionAndDecryption/Decryption";
import { MainProps } from "@src/types";
import Encryption from "@src/components/tabs/encryptionAndDecryption/Encryption";
import { useTranslation } from "react-i18next";
export default function EncryptionAndDecryption({activeSection,isPopup,previousTab,setActiveSection, activeTab}:MainProps) {
    const { t } = useTranslation();
     
    const [selectedTab,setSelectedTab]=useState("encryption");
    const renderComponent = () => {
        switch (selectedTab) {
            case 'encryption':
                return <Encryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection}/>;
            case 'decryption':
                return <Decryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />
            default:
                return <Encryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
        }
      };
      useEffect(()=>{
        if(activeTab){
            setSelectedTab(activeTab);
        }
      },[activeTab])
        return (
            <div >
                <div role="tablist" className="tabs tabs-lifted mt-4">
                    <a
                        role="tab"
                        className={`${selectedTab==="encryption"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("encryption")}
                    >
                        {t("encryption")}
                    </a>
                    <a
                        role="tab"
                        className={`${selectedTab==="decryption"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("decryption")}
                    
                    >
                        {t("decryption")}

                    </a>
                </div>
                <div className="container mx-auto mb-5 pt-3">
                {renderComponent()}
                </div>
            </div>
            
            
        );
}