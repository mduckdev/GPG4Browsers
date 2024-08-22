import { alert, passphraseProps } from "@src/types";
import { PrivateKey, decryptKey, readPrivateKey } from "openpgp";
import React, { useEffect, useRef, useState } from "react";
import Alert from "./Alert";

export default function PassphraseModal({title,text, isVisible,privateKeys, setIsVisible ,onClose, onConfirm}:passphraseProps) {
    const modalRef = useRef<HTMLDialogElement|null>(null);
    
    const [privateKeyPassphrase,setPrivateKeyPassphrase] =  useState<string>("");
    const [currentKeyInfo,setCurrentKeyInfo] =  useState<string>("");
    
    const [currentKey, setCurrentKey] = useState<PrivateKey|null>();
    const [privateKeysParsed, setPrivateKeysParsed] = useState<PrivateKey[]>([]);
    const [alerts,setAlerts] = useState<alert[]>([]);


    const setKeyInfo = async ()=>{
      if(currentKey){
        const userid = await currentKey.getPrimaryUser();
        const fingerprint = currentKey.getFingerprint();
        setCurrentKeyInfo(`${userid.user.userID?.userID}, Key Fingerprint: ${fingerprint}`)
      }
      
    }

    useEffect(()=>{
      setKeyInfo();
    },[currentKey])

    useEffect(()=>{
      if(privateKeys.length <= 0 || privateKeysParsed.length <= 0){
        return;
      }
      const encryptedKeysLeft = privateKeysParsed.find(e=>!e.isDecrypted());
      if(encryptedKeysLeft){
        setCurrentKey(encryptedKeysLeft)
        setKeyInfo()
      }else{
        //triggers function (encryption or decryption) with all keys needed unlocked
        onConfirm(privateKeysParsed);
        setIsVisible(false);
      }
    },[privateKeysParsed])

    useEffect(() => {
      if(isVisible){
        const parsedKeys:PrivateKey[] = [];
        privateKeys.forEach(async e=>{
          const key:PrivateKey|null = await readPrivateKey({armoredKey:e}).catch(e => { console.error(e); return null });
          if(key){
            parsedKeys.push(key);
            setCurrentKey(key);
          }else{
            console.log("Failed to parse provided private key")
          }
        });
        setPrivateKeysParsed(parsedKeys);

      }else{
        setPrivateKeysParsed([]);
      }

      // setIsPassphraseValid(true);
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
      if(!currentKey){
        return;
      }
    const decrytpedKey:PrivateKey|null = await decryptKey({
      privateKey:currentKey,
      passphrase:privateKeyPassphrase
    }).catch(e=>{
      console.error(e);
      return null;
    });

    if(!decrytpedKey){
      setAlerts([
        ...alerts,
        {
          text:"Error! Failed to unlock the private key.",
          style:"alert-error"
        }
      ])
      // setIsPassphraseValid(false);
      return;
    }else{
      const newArray = privateKeysParsed.map(e=>{
        if(e.getFingerprint() === decrytpedKey.getFingerprint()){
          return decrytpedKey;
        }else{
          return e;
        }
      });
      setPrivateKeysParsed(newArray);
      setPrivateKeyPassphrase("");
    }
  }

  const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    handleClose();
  }




  return (
        <dialog ref={modalRef} id="my_modal_4" className="modal" onCancel={handleESC}>
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="py-4">Enter passphrase for key: {currentKeyInfo}</p>
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
              <Alert alerts={alerts} setAlerts={setAlerts} />
            </dialog>
    )
}