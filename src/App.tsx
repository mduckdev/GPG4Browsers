import React, { useEffect, useRef, useState } from 'react';

import Main from './components/Main';
import Navbar from './components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import Browser from 'webextension-polyfill';
import ThemeToggle from './components/ThemeToggle';
import { useAppDispatch, useAppSelector } from './redux/store';
import { setTheme } from './redux/themeSlice';
import { usePrevious } from './utils';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const fetchedTheme  = useAppSelector(state=>state.theme.prefferedTheme);
  const [activeSection, setActiveSection] = useState<string>('EncryptionAndDecryption');
  const [isPopup, setIsPopup] = useState<boolean>(true);
  const [theme, setThemeLocal] = useState<string>(fetchedTheme);
  const previousTab = usePrevious(activeSection);

  useEffect(()=>{
    if(!(['dark','light'].includes(theme))){
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeLocal("dark")
        dispatch(setTheme("dark"))
      }else{
        setThemeLocal("light")
        dispatch(setTheme("light"))
      }
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setIsPopup(params.get("popup")==="false"?false:true);
  },[])

useEffect(()=>{
  dispatch(setTheme(theme));  
  document?.querySelector("html")?.setAttribute("data-theme",theme)
  document?.querySelector("html")?.setAttribute("class",theme)

},[theme])



  const openTab = ()=>{
    Browser.tabs.create({ url: "popup.html?popup=false" });
  }

  return (
  <div className="min-h-screen overscroll-none">
    <div className={`${isPopup?("w-96"):("w-full")} relative`}>
    <ThemeToggle className="absolute top-3 left-3" currentTheme={theme} setTheme={setThemeLocal}/>
    {
      isPopup?(
        <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} className="absolute top-3 right-3 hover:cursor-pointer text-xl" onClick={openTab} />
      ):(null)
    }
      <Main activeSection={activeSection} previousTab={previousTab} setActiveSection={setActiveSection} isPopup={isPopup}/>
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection}/>
    </div>
  </div>
  );
};

export default App;
