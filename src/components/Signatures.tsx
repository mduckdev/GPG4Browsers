import { useAppSelector } from "@src/redux/store";
import React, { useState } from "react";
import Signing from "./tabs/Signing";
import ValidatingSignatures from "./tabs/ValidatingSignatures";
export default function Signatures({activeSection,previousTab,setActiveSection}) {
     
    const [selectedTab,setSelectedTab]=useState("signing");
    const renderComponent = () => {
        switch (selectedTab) {
            case 'signing':
                return <Signing activeSection="signatures" setActiveSection={setActiveSection}/>;
            case 'validatingSignatures':
                return <ValidatingSignatures activeSection="signatures" setActiveSection={setActiveSection} />
            default:
                return <Signing activeSection="signatures" setActiveSection={setActiveSection} />;
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
                        Signing
                    </a>
                    <a
                        role="tab"
                        className={`${selectedTab==="validatingSignatures"?"tab tab-active text-primary":"tab"}`}
                        onClick={()=>setSelectedTab("validatingSignatures")}
                    
                    >
                        Validating signatures
                    </a>
                </div>
                {renderComponent()}
            </div>
            
            
        );
}