import React from "react";

import Encryption from './Encryption';
import Decryption from './Decryption';
import Signing from './Signing';
import Options from './Options';
export default function Main({activeTab}) {
    const renderComponent = () => {
        switch (activeTab) {
          case 'encryption':
            return <Encryption />;
          case 'decryption':
            return <Decryption />;
          case 'signing':
            return <Signing />;
          case 'options':
            return <Options />;
          default:
            return <Encryption />;
        }
      };
    return (
        <div className="container mb-5 pt-8">
        {renderComponent()}
      </div>
    )
}