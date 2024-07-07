import React, { useState } from 'react';

import Main from './components/Main';
import Navbar from './components/Navbar';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('encryption');

  return (
    <div className="min-h-screen">
      <Main activeTab={activeTab}/>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab}/>
    </div>
  );
};

export default App;
