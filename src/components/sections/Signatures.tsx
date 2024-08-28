import React, { useState } from "react";
import Signing from "../tabs/signatures/Signing";
import ValidatingSignatures from "../tabs/signatures/ValidatingSignatures";
import { MainProps, sectionsWithPreviousInterface } from "@src/types";
import { useTranslation } from "react-i18next";
export default function Signatures({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();
     
    const [selectedTab,setSelectedTab]=useState("signing");
    const renderComponent = () => {
        switch (selectedTab) {
            case 'signing':
                return <Signing isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection}/>;
            case 'validatingSignatures':
                return <ValidatingSignatures isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />
            default:
                return <Signing isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
        }
      };
        return (
            <div>
                <div role="tablist" className="tabs tabs-lifted mt-4">
                    <a
                        role="tab"
                        className={`${selectedTab==="signing"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("signing")}
                    >
                        {t("signing")}
                    </a>
                    <a
                        role="tab"
                        className={`${selectedTab==="validatingSignatures"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("validatingSignatures")}
                    
                    >
                        {t("validatingSignatures")}
                    </a>
                </div>
                <div className="container mx-auto mb-5 pt-3">
                {renderComponent()}
                </div>
            </div>
            
            
        );
}