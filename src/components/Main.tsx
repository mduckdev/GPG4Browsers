import React from "react";

import Encryption from './Encryption';
import Decryption from './Decryption';
import Options from './Options';
import AddKey from "./AddKey";
import Signatures from "./Signatures";
import { sectionsWithPreviousInterface } from "@src/types";
export default function Main({activeSection,previousTab,setActiveSection}:sectionsWithPreviousInterface) {
    const renderComponent = () => {
        switch (activeSection) {
          case 'encryption':
            return <Encryption activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'addKey':
            return <AddKey activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'decryption':
            return <Decryption />;
          case 'signatures':
            return <Signatures  activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'options':
            return <Options />;
          default:
            return <Encryption activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
        }
      };
    return (
        <div className="container mx-auto mb-5 pt-8">
        {renderComponent()}
      </div>
    )
}