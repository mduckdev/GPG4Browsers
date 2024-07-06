import React, { useState } from 'react';
import Encryption from './components/Encryption';
import Decryption from './components/Decryption';
import Signing from './components/Signing';
import Options from './components/Options';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('encryption');

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
    <div className="min-h-screen">
      <div className="container mx-auto pt-8">
        {renderComponent()}
      </div>
      <nav className="fixed bottom-0 w-full p-4 flex justify-around">
        <button
          className={`text-white focus:outline-none ${activeTab === 'encryption' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('encryption')}
        >
          Encryption
        </button>
        <button
          className={`text-white focus:outline-none ${activeTab === 'decryption' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('decryption')}
        >
          Decryption
        </button>
        <button
          className={`text-white focus:outline-none ${activeTab === 'signing' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('signing')}
        >
          Signing
        </button>
        <button
          className={`text-white focus:outline-none ${activeTab === 'options' ? 'font-bold' : ''}`}
          onClick={() => setActiveTab('options')}
        >
          Options
        </button>
      </nav>
    </div>
  );
};

export default App;
