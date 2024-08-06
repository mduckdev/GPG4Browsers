import { useAppSelector } from "@src/redux/store";
import React, { useState } from "react";
import Signing from "./tabs/Signing";
import ValidatingSignatures from "./tabs/ValidatingSignatures";
export default function Signatures({activeTab,previousTab,setActiveTab}) {
     
    const [selectedTab,setSelectedTab]=useState("signing");
    const renderComponent = () => {
        switch (selectedTab) {
            case 'signing':
                return <Signing activeTab="signatures" setActiveTab={setActiveTab}/>;
            case 'validatingSignatures':
                return <ValidatingSignatures activeTab="signatures" setActiveTab={setActiveTab} />
            default:
                return <Signing activeTab="signatures" setActiveTab={setActiveTab} />;
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