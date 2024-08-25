import { Key, Message, PrivateKey } from "openpgp";
import { IPrivateKey } from "./redux/privateKeySlice"
import { IPublicKey } from "./redux/publicKeySlice"

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


export interface DecryptionMaterial{
    data:string|Uint8Array,
    filename?:string,
    isPrivateKey:boolean,
    isUnlocked:boolean
}

export interface passphraseProps extends modalProps{
    dataToUnlock:DecryptionMaterial[];
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

