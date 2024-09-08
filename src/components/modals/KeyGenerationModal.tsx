import { KeyDetailsProps, modalProps} from "@src/types";
import { Key, PrimaryUser, SerializedKeyPair, Subkey, enums, generateKey } from "openpgp";
import React, { useEffect, useRef, useState } from "react";
import BasicKeyInfo from "../tabs/KeyDetails/BasicKeyInfo";
import AllKeys from "../tabs/KeyDetails/AllKeys";
import { useTranslation } from "react-i18next";
import TextInput from "../TextInput";
import { faAt, faUser } from "@fortawesome/free-solid-svg-icons";
import PassphraseTextInput from "../PassphraseTextInput";
import { addPrivateKey } from "@src/redux/privateKeySlice";
import { addPublicKey } from "@src/redux/publicKeySlice";
import { useAppDispatch } from "@src/redux/store";
import { usePrevious } from "@src/utils";
export default function KeyGenerationModal({title,text, isVisible, setIsVisible ,onClose, onConfirm}:modalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [name,setName] = useState<string>("");
  const [email,setEmail] = useState<string>("");
  const [expirationDate,setExpirationDate] = useState<number>(31536000);
  const [passphrase,setPassphrase] = useState<string>("");


  const modalRef = useRef<HTMLDialogElement|null>(null);
  const handleConfirm = async () => {
    const newKey = await generateKey(
      {
        userIDs: {name,email},
        passphrase: passphrase,
        keyExpirationTime: expirationDate,
        format:"object"
      }
      ).catch(e=>{console.error(e);return null})
      if(newKey){
        const userID:PrimaryUser|null = await newKey.privateKey.getPrimaryUser().catch(e=>{console.error(e);return null});
        const name:string = userID?.user.userID?.name || "";
        const email:string = userID?.user.userID?.email || "";
        const userIDString:string = userID?.user.userID?.userID || "";

        dispatch(addPrivateKey({keyValue:newKey.privateKey.armor(),userID:userIDString,name:name,email:email, fingerprint:newKey.privateKey.getFingerprint(),isUnlocked:newKey.privateKey.isDecrypted()}));
        dispatch(addPublicKey({keyValue:newKey.publicKey.armor(),userID:userIDString,name:name,email:email, fingerprint:newKey.publicKey.getFingerprint()}));
    
        if(onConfirm){
          onConfirm()
        }
      }



    setIsVisible(false)
  }
  const handleClose = () => {
    if(onClose){
        onClose()
    }
    if (!modalRef.current) {
        return;
      }
      isVisible ? modalRef.current.showModal() : modalRef.current.close();
  }
  const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    setIsVisible(false)
  }
  useEffect(() => {
    handleClose()
  }, [isVisible]);
    return (
      <dialog ref={modalRef} id="my_confirm_modal" className="modal" onCancel={handleESC}>
        <div className="modal-box max-w-xl flex flex-col">
          <div className="max-w-md">
            <TextInput labelText={t("name")} placeholder={t("enterName")} icon={faUser} value={name} setOnChange={setName} />
            <TextInput labelText={t("email")} placeholder={t("enterEmail")} icon={faAt} value={email} setOnChange={setEmail} />
            <div className="my-2 flex flex-col w-full">
              <label>{t("setExpirationDate")}</label>
              <select className="select select-info focus:outline-none w-full" onChange={(e)=>{setExpirationDate(Number(e.target.value))}} defaultValue={31536000}>
                <option disabled>{t("setExpirationDate")}</option>
                <option value={31536000}>{t("1year")}</option>
                <option value={63072000}>{t("2years")}</option>
                <option value={94608000}>{t("3years")}</option>
                <option value={157680000}>{t("5years")}</option>
                <option value={0}>{t("never")}</option>
              </select>
            </div>
            
            <PassphraseTextInput value={passphrase} setOnChange={setPassphrase} />
          </div>
          

            <div className="w-full flex flex-col mt-2">
                <div className="flex gap-2 mx-0">
                  <button className="btn btn-info" onClick={handleConfirm}>{t("confirm")}</button>
                  <button className="btn" onClick={()=>setIsVisible(false)}>{t("cancel")}</button>
                </div>
            </div>
        </div>
      </dialog>
    )
}
