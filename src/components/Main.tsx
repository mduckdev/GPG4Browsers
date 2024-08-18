import React from "react";

import Encryption from './Encryption';
import Decryption from './Decryption';
import Options from './Options';
import AddKey from "./AddKey";
import Signatures from "./Signatures";
import { MainProps } from "@src/types";
export default function Main({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const renderComponent = () => {
        switch (activeSection) {
          case 'encryption':
            return <Encryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'addKey':
            return <AddKey activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'decryption':
            return <Decryption isPopup={isPopup} />;
          case 'signatures':
            return <Signatures  activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'options':
            return <Options />;
          default:
            return <Encryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
        }
      };
    return (
        <div className="mx-auto mb-5 pt-8">
        {renderComponent()}
      </div>
    )
}