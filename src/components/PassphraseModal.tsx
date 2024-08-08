import { passphraseProps } from "@src/types";
import { PrivateKey, decryptKey, readPrivateKey } from "openpgp";
import React, { useEffect, useRef, useState } from "react";

export default function PassphraseModal({title,text, isVisible,privateKey, setIsVisible ,onClose, onConfirm}:passphraseProps) {
    const modalRef = useRef<HTMLDialogElement|null>(null);
    const [privateKeyPassphrase,setPrivateKeyPassphrase] =  useState<string>("");
    const [isPassphraseValid,setIsPassphraseValid] =  useState<boolean>(true);

  useEffect(() => {
    setIsPassphraseValid(true);
    setPrivateKeyPassphrase("");
    if (!modalRef.current) {
      return;
    }
    isVisible ? modalRef.current.showModal() : modalRef.current.close();
  }, [isVisible]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      modalRef?.current?.close();
    }
    if(setIsVisible){
      setIsVisible(false);
    }
  }
  const handleConfirm = async () => {
    const privateKeyParsed:PrivateKey|null = await readPrivateKey({armoredKey:privateKey}).catch(e => { console.error(e); return null });
    if(!privateKeyParsed){
      return;
    }

    const decrytpedKey:PrivateKey|null = await decryptKey({
      privateKey:privateKeyParsed,
      passphrase:privateKeyPassphrase
    }).catch(e=>{
      console.error(e);
      return null;
    });

    if(!decrytpedKey){
      setIsPassphraseValid(false);
      return;
    }

    if (onConfirm && setIsVisible && decrytpedKey) {
      onConfirm(decrytpedKey);
      
      setIsVisible(false);
    }
  }

  const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    handleClose();
  }


  return (
    <div>
        <dialog ref={modalRef} id="my_modal_4" className="modal" onCancel={handleESC}>
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="py-4">{text}</p>
                <div className="w-full flex flex-col">
                    <input required type="password" id="passphrase" className="border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 " 
                    value={privateKeyPassphrase}
                      onChange={(e)=>{setPrivateKeyPassphrase(e.target.value)}}
                      />
                    
                    <div className="flex gap-2 mx-0">
                      <button className="btn btn-info" onClick={handleConfirm}>Unlock</button>
                      <button className="btn" onClick={handleClose}>Cancel</button>
                    </div>
                </div>
            </div>
            {
            isPassphraseValid?(null):(
          <div role="alert" className="alert alert-error w-11/12 absolute bottom-5 inset-x-auto ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error! Failed to unlock the private key.</span>
          </div>
            )
          }
            </dialog>
          
            
    </div>
    )
}