import React from "react";
import Options from './sections/Options';
import AddKey from "./sections/AddKey";
import Signatures from "./sections/Signatures";
import { MainProps } from "@src/types";
import EncryptionAndDecryption from "./sections/EncryptionAndDecryption";
import KeysManagment from "./sections/KeysManagment";
export default function Main({activeSection,isPopup,previousTab,setActiveSection,activeTab}:MainProps) {
    const renderComponent = () => {
        switch (activeSection) {
          case 'EncryptionAndDecryption':
            return <EncryptionAndDecryption isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} activeTab={activeTab} />;
          case 'AddKey':
            return <AddKey isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection}  />;
          case 'KeysManagment':
            return <KeysManagment isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} />;
          case 'Signatures':
            return <Signatures  isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} activeTab={activeTab} />;
          case 'Options':
            return <Options  isPopup={isPopup} activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection}  />;
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