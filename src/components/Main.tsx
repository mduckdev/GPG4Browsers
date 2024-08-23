import React from "react";
import Options from './Options';
import AddKey from "./AddKey";
import Signatures from "./Signatures";
import { MainProps } from "@src/types";
import EncryptionAndDecryption from "./EncryptionAndDecryption";
import KeysManagment from "./KeysManagment";
export default function Main({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const renderComponent = () => {
        switch (activeSection) {
          case 'EncryptionAndDecryption':
            return <EncryptionAndDecryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'AddKey':
            return <AddKey activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'KeysManagment':
            return <KeysManagment />;
          case 'Signatures':
            return <Signatures  activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'Options':
            return <Options />;
          default:
            return <EncryptionAndDecryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
        }
      };
    return (
        <div className="mx-auto mb-5 pt-8 overflow-x-hidden">
        {renderComponent()}
      </div>
    )
}