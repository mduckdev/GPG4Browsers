import { keyUpdateModal, keyUpdates } from "@src/types";
import { Key } from "openpgp";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
export default function KeyUpdateModal({title, text, keys, isVisible, setIsVisible, onClose, onConfirm}:keyUpdateModal) {
  const { t } = useTranslation();

  const modalRef = useRef<HTMLDialogElement|null>(null);
  const [currentKeyInfo,setCurrentKeyInfo] =  useState<string>("");
  const [confirmationText,setConfirmationText] =  useState<string>("");

  const [confirmedKeys,setConfirmedKeys] = useState<keyUpdates[]>([]);
   
  const [currentKey, setCurrentKey] = useState<keyUpdates|null>();


  const setKeyInfo = async ()=>{
    if(currentKey){
      let text = "";
      if(!currentKey.isUniquePublic && !currentKey.isUniquePrivate){
        text=t("publicAndPrivateUpdateConfirmation")+"?"
      }else if(!currentKey.isUniquePrivate){
        text=t("privateUpdateConfirmation")+"?"
      }else if(!currentKey.isUniquePublic){
        text=t("publicUpdateConfirmation")+"?"
      }
      setConfirmationText(text);
      const userid = await currentKey.key.getPrimaryUser().catch(e=>{console.error(e);return null});
      const fingerprint = currentKey.key.getFingerprint();
      setCurrentKeyInfo(`${userid?.user.userID?.userID}, ${t("keyFingerprint")}: ${fingerprint}`)
    }
    
  }

  useEffect(() => {
    if(isVisible){
      setConfirmedKeys(keys)
    }

    if (!modalRef.current) {
      return;
    }
    isVisible ? modalRef.current.showModal() : modalRef.current.close();
  }, [isVisible]);

  useEffect(()=>{
    setKeyInfo();
  },[currentKey])

  useEffect(()=>{
    if(confirmedKeys.length <= 0){
      setIsVisible(false);
      return;
    }
    const unconfirmedKeysLeft = confirmedKeys.find(e=>!e.confirmed);
    if(unconfirmedKeysLeft){
      setCurrentKey(unconfirmedKeysLeft)
      setKeyInfo()
    }else{
      //triggers function saving to keyring with confirmed keys
      const PGPKeys:Key[] = confirmedKeys.map(e=>{return e.key})
      onConfirm(PGPKeys);
      setIsVisible(false);
    }
  },[confirmedKeys])




  const handleClose = () => {
    if(!currentKey){
      return;
    }

    let temp = confirmedKeys.filter(e=>e.key.getFingerprint()!==currentKey.key.getFingerprint());
    setConfirmedKeys(temp);
    
  }
  const handleConfirm = async () => {
    if(!currentKey){
      return;
    }

    let temp = confirmedKeys.map(e=>{
      if(e.key.getFingerprint() === currentKey.key.getFingerprint()){
        e.confirmed=true;
      }
      return e;
    })
    
    setConfirmedKeys(temp);
  }
  const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    handleClose();
  }
    return (
      <dialog ref={modalRef} id="my_confirm_modal" className="modal" onCancel={handleESC}>
      <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="font-bold text-lg">{title}</h3>
          <div>
            {confirmationText}
          </div>
          <div className="font-bold">
          {currentKeyInfo}
            </div>
          <div className="w-full flex flex-col">
              <div className="flex gap-2 mx-0">
                <button className="btn btn-info" onClick={handleConfirm}>{t("confirm")}</button>
                <button className="btn" onClick={handleClose}>{t("cancel")}</button>
              </div>
          </div>
      </div>
     
      </dialog>
    )
}
