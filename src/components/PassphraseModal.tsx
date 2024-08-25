import { CryptoKeys, alert, passphraseProps } from "@src/types";
import { DecryptMessageResult, Message, PrivateKey, decrypt, decryptKey, readMessage, readPrivateKey } from "openpgp";
import React, { useEffect, useRef, useState } from "react";
import Alert from "./Alert";
import PassphraseTextInput from "./PassphraseTextInput";

export default function PassphraseModal({title,text, isVisible, dataToUnlock, setIsVisible ,onClose, onConfirm}:passphraseProps) {
    const modalRef = useRef<HTMLDialogElement|null>(null);
    
    const [currentPassphrase,setCurrentPassphrase] =  useState<string>("");
    const [currentKeyInfo,setCurrentKeyInfo] =  useState<string>("");
    
    const [currentKey, setCurrentKey] = useState<CryptoKeys|null>();
    const [tempKeys, setTempKeys] = useState<CryptoKeys[]>([]);
    const [alerts,setAlerts] = useState<alert[]>([]);


    const setKeyInfo = async ()=>{
      if(currentKey?.isPrivateKey && typeof currentKey.data ==="string"){
        const key = await readPrivateKey({armoredKey:currentKey.data}).catch(e => { console.error(e); return null });
        const userid = await key?.getPrimaryUser();
        const fingerprint = key?.getFingerprint();
        setCurrentKeyInfo(`${userid?.user.userID?.userID}, Key Fingerprint: ${fingerprint}`)
      }
      if(!currentKey?.isPrivateKey){
        setCurrentKeyInfo(currentKey?.filename?`Encrypted file: ${currentKey?.filename}`:"Encrypted message.")
      }
      
    }

    useEffect(()=>{
      setKeyInfo();
    },[currentKey])

    useEffect(()=>{
      if(dataToUnlock.length <= 0 || tempKeys.length <= 0){
        return;
      }
      const encryptedKeysLeft = tempKeys.find(e=>!e.isUnlocked);
      if(encryptedKeysLeft){
        setCurrentKey(encryptedKeysLeft)
        setKeyInfo()
      }else{
        //triggers function (encryption or decryption) with all keys needed unlocked
        onConfirm(tempKeys);
        setIsVisible(false);
      }
    },[tempKeys])

    useEffect(() => {
      if(isVisible){
        
        setTempKeys(dataToUnlock);

      }else{
        setTempKeys([]);
      }

      // setIsPassphraseValid(true);
      setCurrentPassphrase("");
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

    if(currentKey.isPrivateKey && typeof currentKey.data==="string"){ //current key is a locked private key
      const parsedCurrentKey = await readPrivateKey({armoredKey:currentKey.data}).catch(e => { console.error(e); return null });
      if(!parsedCurrentKey){
        return;
      }

      const decrytpedKey:PrivateKey|null = await decryptKey({
        privateKey:parsedCurrentKey,
        passphrase:currentPassphrase
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
        return;
      }else{
        const newArray = await Promise.all(tempKeys.map(async e=>{
        if(e.isPrivateKey && typeof e.data==="string"){
          const key = await readPrivateKey({armoredKey:e.data}).catch(e => { console.error(e); return null });
          if(!key){
            return e;
          }
          if(key.getFingerprint() === decrytpedKey.getFingerprint()){
            return {data:decrytpedKey.armor(),isPrivateKey:true,isUnlocked:true};
          }else{
            return e;
          }
        }else{
          return e;
        }
          
        }))
        setTempKeys(newArray);
        setCurrentPassphrase("");
      }
    }

    if(!currentKey.isPrivateKey){ //message/file encrypted with password
      let decryptedMessage:DecryptMessageResult|null
      if(currentKey.data instanceof Uint8Array){
        const encryptedMessage = await readMessage({binaryMessage:currentKey.data}).catch(e => { console.error(e); return null });
        if(!encryptedMessage){
          return
        }
         decryptedMessage = await decrypt({message:encryptedMessage,passwords:currentPassphrase,format:"binary"}).catch(e => { console.error(e); return null });
      }else{
        const encryptedMessage = await readMessage({armoredMessage:currentKey.data}).catch(e => { console.error(e); return null });
        if(!encryptedMessage){
          return
        }
         decryptedMessage = await decrypt({message:encryptedMessage,passwords:currentPassphrase}).catch(e => { console.error(e); return null });
      }
      if(!decryptedMessage){
        setAlerts([
          ...alerts,
          {
            text:`Error! Incorrect passphrase for `+(currentKey.filename?(`file:${currentKey.filename}`):"encrypted message"),
            style:"alert-error"
          }
        ])
        return;
      }else{
        const newArray = await Promise.all(tempKeys.map(async e=>{
          if(!e.isPrivateKey){
            if(e.data === currentKey.data){
              return {data:currentPassphrase, isPrivateKey:false,isUnlocked:true};
            }else{
              return e;
            }
          }else{
            return e;
          }
          }));
          setTempKeys(newArray);
          setCurrentPassphrase("");
      }
      
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
                <p className="py-2">Enter passphrase for: {currentKeyInfo}</p>
                <div className="w-full flex flex-col">
                    <PassphraseTextInput value={currentPassphrase} setOnChange={setCurrentPassphrase}/>
                    
                    <div className="flex gap-2 mx-0 mt-3">
                      <button className="btn btn-info" onClick={handleConfirm}>Unlock</button>
                      <button className="btn" onClick={handleClose}>Cancel</button>
                    </div>
                </div>
            </div>
              <Alert alerts={alerts} setAlerts={setAlerts} />
            </dialog>
    )
}