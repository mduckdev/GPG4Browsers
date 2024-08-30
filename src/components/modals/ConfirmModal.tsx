import { KeyDetailsProps} from "@src/types";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
export default function ConfirmModal({title,text, isVisible, selectedKey, setIsVisible ,onClose, onConfirm}:KeyDetailsProps) {
  const { t } = useTranslation();

  const modalRef = useRef<HTMLDialogElement|null>(null);
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
        <div className="modal-box w-11/12 max-w-5xl relative">
          <FontAwesomeIcon className="absolute top-5 right-5 cursor-pointer hover:opacity-50" icon={faXmark} onClick={e=>setIsVisible(false)} />
          <h3 className="font-bold">{title}</h3>
          <p>{text}</p>
          <div className="flex gap-2 mx-0">
            <button className="btn btn-info" onClick={handleConfirm}>{t("confirm")}</button>
            <button className="btn" onClick={()=>setIsVisible(false)}>{t("cancel")}</button>
          </div>

        </div>
     
      </dialog>
    )
}
