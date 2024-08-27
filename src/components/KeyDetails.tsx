import { KeyDetailsProps, keyUpdateModal, keyUpdates } from "@src/types";
import { publicKeyEnumToReadable } from "@src/utils";
import { Key } from "openpgp";
import React, { useEffect, useRef, useState } from "react";
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
            <p>Name: <span className="font-bold">{selectedKey.primaryName}</span></p>
            <p>Email: <span className="font-bold">{selectedKey.primaryEmail}</span></p>
            <p>Is this a private key? {selectedKey.isPrivate?(<span className="font-bold">Yes</span>):(<span className="font-bold">No</span>)}</p>
            <p>Creation date: <span className="font-bold"> {selectedKey.creationDate.toLocaleDateString()}</span></p>
            <p>Expiration date: <span className={`font-bold ${(selectedKey.expirationDate==="Invalid/revoked key")?("text-error"):("text-success")}`}>{selectedKey.expirationDate}</span></p>
            <p>Algorithm: <span className="font-bold">{`${publicKeyEnumToReadable(selectedKey.algorithm.algorithm)} ${selectedKey.algorithm.bits?(`(${selectedKey.algorithm.bits} bits)`):('')} ${selectedKey.algorithm.curve?(`(${selectedKey.algorithm.curve})`):('')}`}</span></p>
            <p>Key fingerprint: <span className="font-bold">{selectedKey.fingerprint.toUpperCase()}</span></p>


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
            Keys
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
