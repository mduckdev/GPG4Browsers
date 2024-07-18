import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faCog, faFileSignature } from '@fortawesome/free-solid-svg-icons';
export default function Navbar({activeTab, setActiveTab}) {
    return (
      <nav className="fixed bottom-0 w-full flex justify-around border border-slate-700 bg-slate-750 rounded-b-lg">
        <button
          className={`dark:text-slate-50 p-4 w-full focus:outline-none h-full items-center justify-center ${activeTab === 'encryption' ? 'opacity-75' : ''} hover:opacity-75`}
          onClick={() => setActiveTab('encryption')}
        >
          <FontAwesomeIcon icon={faLock} size="2x"/>
        </button>
        <button
          className={`dark:text-slate-50 p-4 w-full focus:outline-none h-full flex items-center justify-center ${activeTab === 'decryption' ? 'opacity-75' : ''} hover:opacity-75`}
          onClick={() => setActiveTab('decryption')}
        >
          
          <FontAwesomeIcon icon={faUnlock} size="2x"/>
        </button>
        <button
          className={`dark:text-slate-50 p-4 w-full focus:outline-none h-full flex items-center justify-center ${activeTab === 'signing' ? 'opacity-75' : ''} hover:opacity-75`}
          onClick={() => setActiveTab('signing')}
        >
          <FontAwesomeIcon icon={faFileSignature} size="2x"/>
        </button>
        <button
          className={`dark:text-slate-50 p-4 w-full focus:outline-none h-full flex items-center justify-center ${activeTab === 'options' ? 'opacity-75' : ''} hover:opacity-75`}
          onClick={() => setActiveTab('options')}
        >
          <FontAwesomeIcon icon={faCog} size="2x"/>
        </button>
      </nav>
    )
}