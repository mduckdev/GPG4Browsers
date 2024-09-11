import { KeyDetailsProps, alert} from "@src/types";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faXmark } from "@fortawesome/free-solid-svg-icons";
import PassphraseTextInput from "../PassphraseTextInput";
import { PrimaryUser, PrivateKey, decryptKey, encryptKey, readPrivateKey } from "openpgp";
import Alert from "../Alert";
import { useAppDispatch } from "@src/redux/store";
import { addPrivateKey } from "@src/redux/privateKeySlice";
import { addPublicKey } from "@src/redux/publicKeySlice";
import { setLastSection } from "@src/redux/historySlice";
export default function ChagnePassphraseModal({title,text, isVisible, selectedKey, setIsVisible ,onClose, onConfirm}:KeyDetailsProps) {
  const { t } = useTranslation();
  const [oldPassphrase,setOldPassphrase] = useState<string>("");
  const [newPassphrase,setNewPassphrase] = useState<string>("");
  const [newPassphraseAgain,setNewPassphraseAgain] = useState<string>("");
  const [alerts,setAlerts] = useState<alert[]>([]);
  const dispatch = useAppDispatch();


  const modalRef = useRef<HTMLDialogElement|null>(null);

  const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    setIsVisible(false)
  }

  const reEncrypt = async ()=>{
    if(newPassphrase !== newPassphraseAgain){
        setAlerts([
            ...alerts,
            {
                text:t("newPasswordDoesnttMatch"),
                style:"alert-error"
            }
        ])
        return;
    }
    if(newPassphrase === ""){
        setAlerts([
            ...alerts,
            {
                text:t("newPasswordCantBeEmpty"),
                style:"alert-error"
            }
        ])
        return;
    }

    let privateKey:PrivateKey|null=await readPrivateKey({armoredKey:selectedKey.armoredKey}).catch(e=>{console.error(e);return null});
    if(!privateKey){
        setAlerts([
            ...alerts,
            {
                text:t("failedToParseKey"),
                style:"alert-error"
            }
        ])
        return;
    }
    if(!privateKey.isDecrypted()){
        const decryptedKey:PrivateKey|null = await decryptKey({privateKey:privateKey,passphrase:oldPassphrase}).catch(e=>{console.error(e);return null});
        if(!decryptedKey){
            setAlerts([
                ...alerts,
                {
                    text:t("errorFailedToUnlockPrivKey"),
                    style:"alert-error"
                }
            ])
            return;
        }
        privateKey=decryptedKey;
    }
    const newKey = await encryptKey({privateKey:privateKey,passphrase:newPassphrase}).catch(e=>{console.error(e);return null});
    const userID:PrimaryUser|undefined = await newKey?.getPrimaryUser().catch(e=>{console.error(e);return undefined});
    const name:string = userID?.user.userID?.name || "";
    const email:string = userID?.user.userID?.email || "";
    const userIDString:string = userID?.user.userID?.userID || "";
    if(!newKey){
        setAlerts([
            ...alerts,
            {
                text:t("failedToEncryptKey"),
                style:"alert-error"
            }
        ])
        return;
    }
    dispatch(addPrivateKey({
        keyValue:newKey.armor(),
        userID:userIDString,
        name:name,
        email:email,
        fingerprint:newKey.getFingerprint(),
        isUnlocked:newKey.isDecrypted()
    }));
    dispatch(addPublicKey({
        keyValue:newKey.toPublic().armor(),
        userID:userIDString,
        name:name,
        email:email,
        fingerprint:newKey.toPublic().getFingerprint(),
    }));
    dispatch(setLastSection("KeysManagment"));
    window.location.reload();
  }

  useEffect(() => {
    if (!modalRef.current) {
        return;
      }
      isVisible ? modalRef.current.showModal() : modalRef.current.close();
  }, [isVisible]);
    return (
      <dialog ref={modalRef} id="my_confirm_modal" className="modal" onCancel={handleESC} >
        <div className="modal-box w-11/12 max-w-6xl relative">
          <FontAwesomeIcon className="absolute top-5 right-5 cursor-pointer hover:opacity-50" icon={faXmark} onClick={e=>setIsVisible(false)} />
          {
            selectedKey.isDecrypted?(null):(
                <PassphraseTextInput label={t("oldPassphrase")} placeholder={t("oldPassphrasePlaceholder")} value={oldPassphrase} setOnChange={setOldPassphrase}/>
            )
          }  
          <PassphraseTextInput label={t("newPassphrase")} placeholder={t("newPassphrasePlaceholder")} value={newPassphrase} setOnChange={setNewPassphrase}/>
          <PassphraseTextInput label={t("confirmNewPassphrase")} placeholder={t("confirmNewPassphraselaceholder")} value={newPassphraseAgain} setOnChange={setNewPassphraseAgain}/>
          <button id="saveButton" className="w-full btn btn-info mt-4" onClick={reEncrypt}>{t("save")}</button>
          <button id="saveButton" className="w-full btn mt-4" onClick={()=>setIsVisible(false)}>{t("cancel")}</button>
          
        </div>
        <Alert alerts={alerts} setAlerts={setAlerts} />

      </dialog>
    )
}
