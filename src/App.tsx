import React, { useState } from 'react';

import Main from './components/Main';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('encryption');
  return (
  <div className="min-h-screen">
    <div className="w-80">
      <Main activeTab={activeTab} setActiveTab={setActiveTab}/>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab}/>
    </div>
  </div>
  );
};

export default App;