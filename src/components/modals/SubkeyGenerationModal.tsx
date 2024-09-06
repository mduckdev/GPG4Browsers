import { CryptoKeys, KeyDetailsProps, modalProps} from "@src/types";
import { Key, PrimaryUser, PrivateKey, SerializedKeyPair, Subkey, encryptKey, enums, generateKey, readPrivateKey } from "openpgp";
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
import { updateIsKeyUnlocked, usePrevious } from "@src/utils";
import PassphraseModal from "./PassphraseModal";
import { setLastSection } from "@src/redux/historySlice";
export default function SubkeyGenerationModal({title,text,selectedKey, isVisible, setIsVisible ,onClose, onConfirm}:KeyDetailsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [isPassphraseModalVisible,setIsPassphraseModalVisible] = useState<boolean>(false);
  const [isSelectedPrivateKeyUnlocked,setIsSelectedPrivateKeyUnlocked] = useState<boolean>(false);
  const [isSubkeySignOnly,setIsSubkeySignOnly] = useState<boolean>(false);
  const [passphrase,setPassphrase] = useState<string>("");
  const [updatedKey,setUpdatedKey] = useState<PrivateKey|null>(null);
  const [expirationDate,setExpirationDate] = useState<number>(31536000);



  const modalRef = useRef<HTMLDialogElement|null>(null);

  const saveUpdatedKey = async()=>{
    const oldKeyParsed = await readPrivateKey({armoredKey:selectedKey.armoredKey}).catch(e => { console.error(e); return null });

    if(!updatedKey || (passphrase === "" && !oldKeyParsed?.isDecrypted())){
      return;
    }
    let keyToSave:PrivateKey|null;
    if(!oldKeyParsed?.isDecrypted()){
      keyToSave = await encryptKey({privateKey:updatedKey,passphrase:passphrase}).catch(e => { console.error(e); return null });
    }else{
      keyToSave = updatedKey;
    }
    if(!keyToSave){
      return;
    }

    const userID:PrimaryUser|null = await keyToSave.getPrimaryUser().catch(e=>{console.error(e);return null});
    const name:string = userID?.user.userID?.name || "";
    const email:string = userID?.user.userID?.email || "";
    const userIDString:string = userID?.user.userID?.userID || "";
    dispatch(addPrivateKey({keyValue:keyToSave.armor(),fingerprint:keyToSave.getFingerprint(),userID:userIDString,name:name,email:email, isUnlocked:keyToSave.isDecrypted()}));
    dispatch(addPublicKey({keyValue:keyToSave.toPublic().armor(),fingerprint:keyToSave.getFingerprint(),userID:userIDString,name:name,email:email}))
    dispatch(setLastSection("KeysManagment"));
    window.location.reload();
    setIsVisible(false)
  }

  const handleConfirm = async (privateKey:CryptoKeys[]) => {
    const isUnlocked = privateKey[0]?.isUnlocked;
    if(!isUnlocked){
      setIsPassphraseModalVisible(true);
      setIsVisible(false);
      return;
    }

    const privKeyToUpdate = privateKey[0]?.data;
    if(typeof privKeyToUpdate !=="string"){
      return;
    }
    const privateKeyParsed = await readPrivateKey({armoredKey:privKeyToUpdate}).catch(e => { console.error(e); return null });
    if(!privateKeyParsed){
      return;
    }
    let config={sign:false, keyExpirationTime:expirationDate};
    if(isSubkeySignOnly){
      config.sign = true;
    }
    const newPrivateKey = await privateKeyParsed.addSubkey(config).catch(e => { console.error(e); return null });
    if(!newPrivateKey){
      return;
    }
    setUpdatedKey(newPrivateKey)
  }
  const handleClose = () => {
    if(onClose){
        onClose()
    }
    setIsVisible(false);
  }
  const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    setIsVisible(false)
}
  useEffect(() => {
    if (!modalRef.current) {
      return;
    }
    isVisible ? modalRef.current.showModal() : modalRef.current.close();
  }, [isVisible]);
  useEffect(()=>{
    updateIsKeyUnlocked(selectedKey.armoredKey,setIsSelectedPrivateKeyUnlocked);
  },[selectedKey]);
  useEffect(()=>{
    saveUpdatedKey();
  },[passphrase,updatedKey]);
    return (
        <div>
            <PassphraseModal title={t("passphrase")}text={t("enterPassphrase")} isVisible={isPassphraseModalVisible} setIsVisible={setIsPassphraseModalVisible} dataToUnlock={[{data:selectedKey.armoredKey,isPrivateKey:true,isUnlocked:isSelectedPrivateKeyUnlocked}]} onConfirm={handleConfirm} onClose={()=>{}} setPassphraseValue={setPassphrase} />

            <dialog ref={modalRef} id="my_confirm_modal" className="modal" onCancel={handleESC}>
                <div className="modal-box w-11/12 max-w-5xl">
                    <div className="w-full flex flex-col mt-2">
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">{t("signOnly")}</span>
                          <input type="radio" name="radio-10" className="radio checked:bg-blue-500" onChange={(e)=>{setIsSubkeySignOnly(e.target.checked)}} />
                        </label>
                      </div>
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">{t("encryptOnly")}</span>
                          <input type="radio" name="radio-10" className="radio checked:bg-blue-500" defaultChecked />
                        </label>
                      </div>
                      <select className="select select-info focus:outline-none w-full max-w-xs" onChange={(e)=>{setExpirationDate(Number(e.target.value))}} defaultValue={31536000}>
                        <option disabled>{t("setExpirationDate")}</option>
                        <option value={31536000}>{t("1year")}</option>
                        <option value={63072000}>{t("2years")}</option>
                        <option value={94608000}>{t("3years")}</option>
                        <option value={157680000}>{t("5years")}</option>
                        <option value={0}>{t("never")}</option>
                      </select>
                        <div className="flex gap-2 mx-0 mt-2">
                          <button className="btn btn-info" onClick={()=>{handleConfirm([{data:selectedKey.armoredKey,isPrivateKey:true,isUnlocked:isSelectedPrivateKeyUnlocked}])}}>{t("confirm")}</button>
                          <button className="btn" onClick={handleClose}>{t("cancel")}</button>
                        </div>
                    </div>
                </div>
            </dialog>
        </div>
        
    )
}
