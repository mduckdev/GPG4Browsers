import { IPrivateKey } from "./redux/privateKeySlice"
import { IPublicKey } from "./redux/publicKeySlice"

export interface sectionsPropsInterface{
    activeSection:string,
    setActiveSection:Function
}

export interface sectionsWithPreviousInterface extends sectionsPropsInterface{
    previousTab:string
}
export interface outputTextareaPropsInterface{
    textValue:string
}

export interface KeyDropdownProps{
    label:string,
    privateKeysList:IPublicKey[]|IPrivateKey[],
    setSelectedKey:Function,
    setActiveSection:Function
}
export interface passphraseProps{
    title:string;
    text:string;
    isVisible:any;
    privateKey:string;
    setIsVisible:Function;
    onClose?:Function;
    onConfirm:Function;
}

export interface themeTogglePropsInterface{
    className:string,
    currentTheme:string,
    setTheme:Function
}