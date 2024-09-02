import { KeyDetailsProps} from "@src/types";
import React, { useEffect, useRef, useState } from "react";
import BasicKeyInfo from "../tabs/KeyDetails/BasicKeyInfo";
import AllKeys from "../tabs/KeyDetails/AllKeys";
import { useTranslation } from "react-i18next";
import AllUsers from "../tabs/KeyDetails/AllUsers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faXmark } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "./ConfirmModal";
import { useAppDispatch } from "@src/redux/store";
import { deletePrivateKey } from "@src/redux/privateKeySlice";
import { deletePublicKey } from "@src/redux/publicKeySlice";
import { setLastSection } from "@src/redux/historySlice";
import ExportKeysModal from "./ExportKeysModal";
export default function KeyDetailsModal({title,text, isVisible, selectedKey, setIsVisible ,onClose, onConfirm}:KeyDetailsProps) {
  const { t } = useTranslation();
  const [isConfirmModalVisible,setIsConfirmModalVisible] = useState<boolean>(false);
  const [isExportModalVisible,setIsExportModalVisible] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const modalRef = useRef<HTMLDialogElement|null>(null);

  const deleteKey = async()=>{
    dispatch(deletePrivateKey(selectedKey.fingerprint.toLowerCase()));
    dispatch(deletePublicKey(selectedKey.fingerprint.toLowerCase()));
    dispatch(setLastSection("KeysManagment"));
    window.location.reload();
  }

  const handleConfirm = async () => {
    if(onConfirm){
        onConfirm()
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
      <dialog ref={modalRef} id="my_confirm_modal" className="modal" onCancel={handleESC} >
        <ConfirmModal title={t("additionalConfirmationNeeded")} text={t("confirmDeletingThisKey")} isVisible={isConfirmModalVisible} setIsVisible={setIsConfirmModalVisible} selectedKey={selectedKey} onConfirm={deleteKey} />
        <ExportKeysModal  isVisible={isExportModalVisible} setIsVisible={setIsExportModalVisible} selectedKey={selectedKey} onConfirm={()=>{}} />

        <div className="modal-box w-11/12 max-w-5xl relative">
          <FontAwesomeIcon className="absolute top-5 right-5 cursor-pointer hover:opacity-50" icon={faXmark} onClick={e=>setIsVisible(false)} />
          <div role="tablist" className="tabs tabs-lifted">
          <input type="radio" defaultChecked  name="my_tabs_2" role="tab" className="tab" aria-label={t("info")} />
          <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <BasicKeyInfo selectedKey={selectedKey}/>
          </div>

          <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab"
              aria-label={t("users")}
              />
          <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <AllUsers selectedKey={selectedKey}/>
          </div>

          <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label={t("keys")} />
          <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <AllKeys selectedKey={selectedKey} setParentVisible={setIsVisible}/>
              
          </div>
          </div>
            <div className="w-full flex flex-col mt-2">
                <div className="flex gap-2 mx-0">
                  <button className="btn btn-success" onClick={handleConfirm}>{t("save")}</button>
                  <button className="btn" onClick={()=>setIsVisible(false)}>{t("cancel")}</button>
                  <button className="btn btn-error" onClick={()=>{setIsConfirmModalVisible(true);setIsVisible(false)}}>{t("deleteKey")}</button>
                  <button className="btn" onClick={()=>{setIsVisible(false);setIsExportModalVisible(true)}}>
                    {t("exportKeys")}
                    <FontAwesomeIcon icon={faDownload}/>
                  </button>


                </div>
            </div>
        </div>
     
      </dialog>
    )
}
