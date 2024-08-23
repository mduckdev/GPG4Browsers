import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faCog, faFileSignature, faKey } from '@fortawesome/free-solid-svg-icons';
import { sectionsPropsInterface } from "@src/types";
export default function Navbar({activeSection, setActiveSection}:sectionsPropsInterface) {
    return (
      <nav className="btm-nav">
        <button
          className={`${activeSection === 'EncryptionAndDecryption' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('EncryptionAndDecryption')}
        >
          <FontAwesomeIcon icon={faLock}/>
          <span className="btm-nav-label">Encryption</span>
        </button>
        <button
          className={`${activeSection === 'Signatures' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('Signatures')}
        >
          <FontAwesomeIcon icon={faFileSignature} />
          <span className="btm-nav-label">Signatures</span>

        </button>
        <button
          className={`${activeSection === 'KeysManagment' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('KeysManagment')}
        >
          
          <FontAwesomeIcon icon={faKey} />
          <span className="btm-nav-label">My keys </span>

        </button>
        <button
          className={`${activeSection === 'Options' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('Options')}
        >
          <FontAwesomeIcon icon={faCog} />
          <span className="btm-nav-label">Options</span>

        </button>
      </nav>
    )
}