import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faCog, faFileSignature } from '@fortawesome/free-solid-svg-icons';
export default function Navbar({activeTab, setActiveTab}) {
    return (
      <nav className="btm-nav">
        <button
          className={`${activeTab === 'encryption' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveTab('encryption')}
        >
          <FontAwesomeIcon icon={faLock}/>
          <span className="btm-nav-label">Encryption</span>
        </button>
        <button
          className={`${activeTab === 'decryption' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveTab('decryption')}
        >
          
          <FontAwesomeIcon icon={faUnlock} />
          <span className="btm-nav-label">Decryption</span>

        </button>
        <button
          className={`${activeTab === 'signing' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveTab('signing')}
        >
          <FontAwesomeIcon icon={faFileSignature} />
          <span className="btm-nav-label">Signatures</span>

        </button>
        <button
          className={`${activeTab === 'options' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveTab('options')}
        >
          <FontAwesomeIcon icon={faCog} />
          <span className="btm-nav-label">Options</span>

        </button>
      </nav>
    )
}