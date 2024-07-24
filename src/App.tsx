import React, { useEffect, useState } from 'react';

import Main from './components/Main';
import Navbar from './components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import Browser from 'webextension-polyfill';

const App: React.FC = () => {

  const [activeTab, setActiveTab] = useState<string>('encryption');
  const [isPopup, setIsPopup] = useState<boolean>(true);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    setIsPopup(params.get("popup")==="false"?false:true)
  },[])

  const openTab = ()=>{
    Browser.tabs.create({ url: "popup.html?popup=false" });
  }

  return (
  <div className="min-h-screen">
    <div className={`${isPopup?("w-80"):("w-full")} relative`}>
    {
      isPopup?(
        <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} className="absolute top-3 right-3 hover:cursor-pointer" onClick={openTab} />
      ):(null)
    }
      <Main activeTab={activeTab} setActiveTab={setActiveTab}/>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab}/>
    </div>
  </div>
  );
};

export default App;
