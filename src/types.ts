import { AlgorithmInfo, Key, KeyID, Message, PrivateKey, SignaturePacket, Subkey, UserID } from "openpgp";
import { IPrivateKey } from "./redux/privateKeySlice"
import { IPublicKey } from "./redux/publicKeySlice"
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { User } from "openpgp";

export interface sectionsPropsInterface{
    activeSection:string,
    setActiveSection:Function
}

export interface sectionsWithPreviousInterface extends sectionsPropsInterface{
    previousTab:string
}
export interface MainProps extends sectionsWithPreviousInterface{
    isPopup:boolean;
}
export interface DecryptionProps{
    isPopup:boolean;
}
export interface outputTextareaPropsInterface{
    textValue:string
}

export interface KeyDropdownProps{
    style?:string,
    label:string,
    isActive:boolean,
    keysList:IPublicKey[]|IPrivateKey[],
    setSelectedKey:Function,
    setActiveSection:Function
}
export interface modalProps{
    title?:string;
    text?:string;
    isVisible:boolean;
    setIsVisible:React.Dispatch<React.SetStateAction<boolean>>;
    onClose?:Function;
    onConfirm:Function;
}


export interface CryptoKeys{
    data:string|Uint8Array,
    filename?:string,
    isPrivateKey:boolean,
    isUnlocked:boolean
}

export interface passphraseProps extends modalProps{
    dataToUnlock:CryptoKeys[],
    setPassphraseValue?:React.Dispatch<React.SetStateAction<string>>
}


export interface themeTogglePropsInterface{
    className:string,
    currentTheme:string,
    setTheme:Function
}

export interface file{
    data:Uint8Array,
    fileName:string
}
export interface decryptedFile extends file{
    signatureMessages:string[],
    signatureStatus:"text-success"|"text-info"|"text-error"
}
export interface alert{
    text:string,
    style:"alert-error"|"alert-warning"|"alert-success"|"alert-info"|""
}
export interface alertProps{
    alerts:alert[],
    setAlerts:React.Dispatch<React.SetStateAction<alert[]>>;
}

export interface keyUpdates{
    key:Key,
    confirmed:boolean,
    isUniquePublic:boolean,
    isUniquePrivate:boolean,
}

export interface keyUpdateModal extends modalProps{
    keys:keyUpdates[]
}
export interface PassphraseTextInputProps{
    value:string,
    setOnChange:React.Dispatch<React.SetStateAction<string>>;
}

export interface ShowFilesProps{
    files:file[],
    extension:".gpg"|".asc"|".pgp"|".sig"
}
export interface ShowFilesInTableProps{
    files:decryptedFile[],
    removeExtensions:boolean
}
export interface keyInfo{
    isPrivate:boolean,
    primaryName:string,
    primaryEmail:string,
    fingerprint:string,
    armoredKey:string,
    expirationDate:string,
    creationDate:Date,
    algorithm:AlgorithmInfo,
    allKeys:(Key|Subkey)[],
    users:User[],
    isExpired:boolean
}
export interface keyRowInfo{
    isValid:boolean,
    keyID:KeyID,
    creationDate:Date,
    expirationDate:Date|number|null,
    keyFlags:string[]
}


export interface KeyDetailsTabProps{
    selectedKey:keyInfo,
    setParentVisible?:React.Dispatch<React.SetStateAction<boolean>>
}
export interface KeyDetailsProps extends modalProps,KeyDetailsTabProps{}
export interface TextInputProps extends PassphraseTextInputProps{
    icon:IconProp,
    placeholder:string,
    labelText:string,
    className?:string
}
export interface CertificationsTableProps{
    certifications:SignaturePacket[],
    user:User
}

export interface UserCertificationsRow{
    status:string,
    keyFingerprint:string,
    keyID:string,
    issuer:string,
    isValid:boolean
}

export interface SearchKeyModalProps extends modalProps{
    setKeyValue:React.Dispatch<React.SetStateAction<string>>,
    parentAlerts:alert[],
    setParentAlerts:React.Dispatch<React.SetStateAction<alert[]>>,
}