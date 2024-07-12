import React, { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import Main from './components/Main';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('encryption');

  return (
    <div className="min-h-screen">
      <Main activeTab={activeTab} setActiveTab={setActiveTab}/>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab}/>
    </div>
  );
};

export default App;
