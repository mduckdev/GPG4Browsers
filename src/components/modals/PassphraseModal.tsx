import { CryptoKeys, alert, passphraseProps } from "@src/types";
import { DecryptMessageResult, Message, PrivateKey, decrypt, decryptKey, readMessage, readPrivateKey } from "openpgp";
import React, { useEffect, useRef, useState } from "react";
import Alert from "../Alert";
import PassphraseTextInput from "../PassphraseTextInput";
import { attempToDecrypt } from "@src/utils";
import { useTranslation } from "react-i18next";

export default function PassphraseModal({title,text, isVisible, dataToUnlock, setIsVisible ,onClose, onConfirm}:passphraseProps) {
  const { t } = useTranslation();
    const modalRef = useRef<HTMLDialogElement|null>(null);
    
    const [currentPassphrase,setCurrentPassphrase] =  useState<string>("");
    const [currentKeyInfo,setCurrentKeyInfo] =  useState<string>("");
    
    const [currentKey, setCurrentKey] = useState<CryptoKeys|null>();
    const [tempKeys, setTempKeys] = useState<CryptoKeys[]>([]);
    const [alerts,setAlerts] = useState<alert[]>([]);


    const setKeyInfo = async (currentKey:CryptoKeys)=>{
      if(currentKey?.isPrivateKey && typeof currentKey.data ==="string"){
        const key = await readPrivateKey({armoredKey:currentKey.data}).catch(e => { console.error(e); return null });
        const userid = await key?.getPrimaryUser();
        const fingerprint = key?.getFingerprint();
        setCurrentKeyInfo(`${userid?.user.userID?.userID}, ${t("keyFingerprint")}: ${fingerprint}`)
      }
      if(!currentKey?.isPrivateKey){
        setCurrentKeyInfo(currentKey?.filename?`${t("encryptedFile")}: ${currentKey?.filename}`:`${t("encryptedMessage")}.`)
      }
      
    }

    useEffect(()=>{
      if(currentKey){
        setKeyInfo(currentKey);
      }
    },[currentKey])

    useEffect(()=>{
      if(dataToUnlock.length <= 0 || tempKeys.length <= 0){
        return;
      }
      const encryptedKeysLeft = tempKeys.find(e=>!e.isUnlocked);
      if(encryptedKeysLeft){
        setCurrentKey(encryptedKeysLeft)
      }else{
        //triggers function (encryption or decryption) with all keys needed unlocked
        onConfirm(tempKeys);
        setIsVisible(false);
      }
    },[tempKeys])

    useEffect(() => {
      if(isVisible){
        
        setTempKeys(dataToUnlock);

      }else{
        setTempKeys([]);
        setAlerts([])
      }

      // setIsPassphraseValid(true);
      setCurrentPassphrase("");
      if (!modalRef.current) {
        return;
      }
      isVisible ? modalRef.current.showModal() : modalRef.current.close();
    }, [isVisible]);

    const handleClose = () => {
      if (onClose) {
        onClose();
      }
      modalRef?.current?.close();
      if(setIsVisible){
        setIsVisible(false);
      }
    }

    const handleConfirm = async () => {
    if(!currentKey){
      return;
    }
    
    const response = await attempToDecrypt(currentKey,currentPassphrase).catch(e=>{
      setAlerts([
        ...alerts,
        {
          text:e,
          style:"alert-error"
        }
      ]);
      return undefined;
    });
    if(!response){
      return;
    }
    let newArray:CryptoKeys[]=[];
    if(response instanceof PrivateKey){
      newArray = await Promise.all(tempKeys.map(async e=>{
        if(e.isPrivateKey && typeof e.data==="string"){
          const key = await readPrivateKey({armoredKey:e.data}).catch(e => { console.error(e); return null });
          if(!key){
            return e;
          }
          if(key.getFingerprint() === response.getFingerprint()){
            return {data:response.armor(),isPrivateKey:true,isUnlocked:true};
          }else{
            return e;
          }
        }else{
          return e;
        }
        }));
    }else{
      newArray = await Promise.all(tempKeys.map(async e=>{
        if(!e.isPrivateKey){
          if(e.data === currentKey.data){
            return {data:currentPassphrase, isPrivateKey:false,isUnlocked:true};
          }else{
            return e;
          }
        }else{
          return e;
        }
        }));
    }
      setTempKeys(newArray);
      setCurrentPassphrase("");
      
    

   
  }

  const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    handleClose();
  }




  return (
        <dialog ref={modalRef} id="my_modal_4" className="modal" onCancel={handleESC}>
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="py-2">{t("enterPassphrase")}: {currentKeyInfo}</p>
                <div className="w-full flex flex-col">
                    <PassphraseTextInput value={currentPassphrase} setOnChange={setCurrentPassphrase}/>
                    
                    <div className="flex gap-2 mx-0 mt-3">
                      <button className="btn btn-info" onClick={handleConfirm}>{t("unlock")}</button>
                      <button className="btn" onClick={handleClose}>{t("cancel")}</button>
                    </div>
                </div>
            </div>
              <Alert alerts={alerts} setAlerts={setAlerts} />
            </dialog>
    )
}