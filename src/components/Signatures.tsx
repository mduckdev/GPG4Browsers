import { useAppSelector } from "@src/redux/store";
import React, { useState } from "react";
import Signing from "./Signing";
import ValidatingSignatures from "./ValidatingSignatures";
export default function Signatures() {
     
    const [selectedTab,setSelectedTab]=useState("signing");
    const renderComponent = () => {
        switch (selectedTab) {
            case 'signing':
                return <Signing />;
            case 'validatingSignatures':
                return <ValidatingSignatures />
            default:
                return <Signing />;
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