import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faCog, faFileSignature } from '@fortawesome/free-solid-svg-icons';
export default function Navbar({activeSection, setActiveSection}) {
    return (
      <nav className="btm-nav">
        <button
          className={`${activeSection === 'encryption' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('encryption')}
        >
          <FontAwesomeIcon icon={faLock}/>
          <span className="btm-nav-label">Encryption</span>
        </button>
        <button
          className={`${activeSection === 'decryption' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('decryption')}
        >
          
          <FontAwesomeIcon icon={faUnlock} />
          <span className="btm-nav-label">Decryption</span>

        </button>
        <button
          className={`${activeSection === 'signatures' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('signatures')}
        >
          <FontAwesomeIcon icon={faFileSignature} />
          <span className="btm-nav-label">Signatures</span>

        </button>
        <button
          className={`${activeSection === 'options' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('options')}
        >
          <FontAwesomeIcon icon={faCog} />
          <span className="btm-nav-label">Options</span>

        </button>
      </nav>
    )
}