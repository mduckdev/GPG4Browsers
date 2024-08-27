import { KeyDetailsProps} from "@src/types";
import { Key, Subkey } from "openpgp";
import React, { useEffect, useRef, useState } from "react";
import BasicKeyInfo from "./tabs/KeyDetails/BasicKeyInfo";
import AllKeys from "./tabs/KeyDetails/AllKeys";
export default function KeyDetails({title,text, isVisible, selectedKey, setIsVisible ,onClose, onConfirm}:KeyDetailsProps) {
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
      <dialog ref={modalRef} id="my_confirm_modal" className="modal" onCancel={handleESC}>
      <div className="modal-box w-11/12 max-w-5xl">
        <div role="tablist" className="tabs tabs-lifted">
        <input type="radio" defaultChecked  name="my_tabs_2" role="tab" className="tab" aria-label="Info" />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
            <BasicKeyInfo selectedKey={selectedKey}/>
        </div>

        <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab"
            aria-label="Certifications"
            />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
            Certifications
        </div>

        <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Keys" />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
            <AllKeys selectedKey={selectedKey} />
            
        </div>
        </div>
          <div className="w-full flex flex-col mt-2">
              <div className="flex gap-2 mx-0">
                <button className="btn btn-info" onClick={handleConfirm}>Confirm</button>
                <button className="btn" onClick={()=>setIsVisible(false)}>Cancel</button>
              </div>
          </div>
      </div>
     
      </dialog>
    )
}
