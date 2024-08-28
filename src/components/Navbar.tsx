import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCog, faFileSignature, faKey } from '@fortawesome/free-solid-svg-icons';
import { sectionsPropsInterface } from "@src/types";
import { useTranslation } from "react-i18next";
export default function Navbar({activeSection, setActiveSection}:sectionsPropsInterface) {
  const { t } = useTranslation();

    return (
      <nav className="btm-nav">
        <button
          className={`${activeSection === 'EncryptionAndDecryption' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('EncryptionAndDecryption')}
        >
          <FontAwesomeIcon icon={faLock}/>
          <span className="btm-nav-label">{t("encryption")}</span>
        </button>
        <button
          className={`${activeSection === 'Signatures' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('Signatures')}
        >
          <FontAwesomeIcon icon={faFileSignature} />
          <span className="btm-nav-label">{t("signatures")}</span>

        </button>
        <button
          className={`${activeSection === 'KeysManagment' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('KeysManagment')}
        >
          
          <FontAwesomeIcon icon={faKey} />
          <span className="btm-nav-label">{t("myKeys")}</span>

        </button>
        <button
          className={`${activeSection === 'Options' ? 'active' : ''} hover:opacity-75`}
          onClick={() => setActiveSection('Options')}
        >
          <FontAwesomeIcon icon={faCog} />
          <span className="btm-nav-label">{t("options")}</span>

        </button>
      </nav>
    )
}