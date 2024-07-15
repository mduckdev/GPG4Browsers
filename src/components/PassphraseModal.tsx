import React, { useEffect, useRef } from "react";
export default function PassphraseModal({title,text, isVisible,setPrivateKeyPassphrase ,onClose, onConfirm}) {
    const modalRef = useRef(null);

  useEffect(() => {
    if (!modalRef.current) {
      return;
    }
    isVisible ? modalRef.current.showModal() : modalRef.current.close();
  }, [isVisible]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      modalRef.current.close()
    }
  }
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  }

  const handleESC = (event) => {
    event.preventDefault();
    handleClose();
  }


  return (
    <div>
        <dialog ref={modalRef} id="my_modal_4" className="modal" onCancel={handleESC}>
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="py-4">{text}</p>
                <div className="modal-action">
                <form method="dialog">
                    <input required type="password" id="passphrase" className="w-full border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 " 
                      onChange={(e)=>{setPrivateKeyPassphrase(e.target.value)}}
                      />
                    
                    <div className="flex gap-2">
                      <button className="btn btn-info" onClick={handleConfirm}>Confirm</button>
                      <button className="btn" onClick={handleClose}>Close</button>
                    </div>
                </form>
                </div>
            </div>
            </dialog>
    </div>
    )
}