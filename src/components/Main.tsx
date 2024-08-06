import React from "react";

import Encryption from './Encryption';
import Decryption from './Decryption';
import Options from './Options';
import AddKey from "./AddKey";
import Signatures from "./Signatures";
export default function Main({activeTab,previousTab,setActiveTab}) {
    const renderComponent = () => {
        switch (activeTab) {
          case 'encryption':
            return <Encryption activeTab={activeTab} previousTab={previousTab} setActiveTab={setActiveTab} />;
          case 'addKey':
            return <AddKey activeTab={activeTab} previousTab={previousTab} setActiveTab={setActiveTab} />;
          case 'decryption':
            return <Decryption />;
          case 'signatures':
            return <Signatures  activeTab={activeTab} previousTab={previousTab} setActiveTab={setActiveTab} />;
          case 'options':
            return <Options />;
          default:
            return <Encryption activeTab={activeTab} previousTab={previousTab} setActiveTab={setActiveTab} />;
        }
      };
    return (
        <div className="container mx-auto mb-5 pt-8">
        {renderComponent()}
      </div>
    )
}