import { KeyDetailsProps} from "@src/types";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faXmark } from "@fortawesome/free-solid-svg-icons";
import OutputTextarea from "../OutputTextarea";
import { Key, readKey } from "openpgp";
import { convertUint8ToUrl } from "@src/utils";
import ShowGPGFiles from "../ShowGPGFiles";
export default function ExportKeysModal({title,text, isVisible, selectedKey, setIsVisible ,onClose, onConfirm}:KeyDetailsProps) {
  const { t } = useTranslation();
  const [publicKey,setPublicKey] = useState<string>("");
  const [privateKey,setPrivateKey] = useState<string>("");

  const modalRef = useRef<HTMLDialogElement|null>(null);

  const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    event.preventDefault();
    setIsVisible(false)
  }
  const setup=async()=>{
    if(isVisible){
        const parsedKey:Key|null = await readKey({armoredKey:selectedKey.armoredKey}).catch(e => {console.error(e);return null});
        if(!parsedKey){
            return;
        }
        if(parsedKey.isPrivate()){
            setPrivateKey(parsedKey.armor())
        }
        setPublicKey(parsedKey.toPublic().armor())
    }else{
        setPrivateKey("");
        setPublicKey("");
    }
  }
  useEffect(() => {
    setup()
    if (!modalRef.current) {
        return;
      }
      isVisible ? modalRef.current.showModal() : modalRef.current.close();
  }, [isVisible]);
    return (
      <dialog ref={modalRef} id="my_confirm_modal" className="modal" onCancel={handleESC} >
        <div className="modal-box w-11/12 max-w-6xl relative">
          <FontAwesomeIcon className="absolute top-5 right-5 cursor-pointer hover:opacity-50" icon={faXmark} onClick={e=>setIsVisible(false)} />
          <div className="flex w-full flex-col lg:flex-row">
            <div className="card rounded-box flex-grow place-items-center w-1/2 justify-end">
                <p className="font-bold">{t("publicKey")}</p>
                <OutputTextarea textValue={publicKey}/>
                <ShowGPGFiles files={[{data:new TextEncoder().encode(publicKey),fileName:`${selectedKey.fingerprint}_PUBLIC_KEY`}]} extension=".asc"/>
            </div>
            <div className="divider lg:divider-horizontal"></div>
            <div className="card rounded-box flex-grow place-items-center w-1/2 justify-end">
                <p className="font-bold">{t("privateKey")}</p>
                <p>{t("privateKeyWarning")}</p>
                <OutputTextarea textValue={privateKey}/>
                <ShowGPGFiles files={[{data:new TextEncoder().encode(privateKey),fileName:`${selectedKey.fingerprint}_PRIVATE_KEY`}]} extension=".asc"/>

            </div>
            </div>
          
        </div>

      </dialog>
    )
}
