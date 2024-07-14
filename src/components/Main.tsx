import React from "react";

import Encryption from './Encryption';
import Decryption from './Decryption';
import Signing from './Signing';
import Options from './Options';
import AddPublicKey from "./AddPublicKey";
import AddprivateKey from "./AddPrivateKey";
export default function Main({activeTab,setActiveTab}) {
    const renderComponent = () => {
        switch (activeTab) {
          case 'encryption':
            return <Encryption activeTab={activeTab} setActiveTab={setActiveTab} />;
          case 'addPublicKey':
            return <AddPublicKey activeTab={activeTab} setActiveTab={setActiveTab} />;
            case 'addPrivateKey':
            return <AddprivateKey activeTab={activeTab} setActiveTab={setActiveTab} />;
          case 'decryption':
            return <Decryption />;
          case 'signing':
            return <Signing />;
          case 'options':
            return <Options />;
          default:
            return <Encryption activeTab={activeTab} setActiveTab={setActiveTab} />;
        }
      };
    return (
        <div className="container mx-auto mb-5 pt-8">
        {renderComponent()}
      </div>
    )
}