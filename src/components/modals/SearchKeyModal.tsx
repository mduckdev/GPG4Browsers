import { SearchKeyModalProps, alert, modalProps} from "@src/types";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import TextInput from "../TextInput";
import Alert from "../Alert";
import { RootState, useAppSelector } from "@src/redux/store";
export default function SearchKeysModal({ isVisible, setIsVisible, setKeyValue, parentAlerts, setParentAlerts ,onClose, onConfirm}:SearchKeyModalProps) {
    const { t } = useTranslation();
    const preferences = useAppSelector((state:RootState)=>state.preferences);

    const [searchQuery,setSearchQuery] = useState<string>("")
    const modalRef = useRef<HTMLDialogElement|null>(null);
    const [alerts,setAlerts] = useState<alert[]>([]);

    const handleESC = (event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
        event.preventDefault();
        setIsVisible(false)
    }
    const handleQuery = async()=>{
        const query:string = "/pks/lookup?op=get&options=mr&search=";
        if(searchQuery===""){
            return;
        }
        const urlEscapedQuery:string = encodeURI(searchQuery);

        for(const URL of preferences.keyServers){
            const response = await fetch(`${URL}${query}${urlEscapedQuery}`).then((e:Response)=>{
                if(e.headers.get("content-type")==="application/pgp-keys"){
                    return e.text()
                }else{
                    return null
                }
            }).catch(e=>{console.error(e);return null});
            if(!response){
                setAlerts([
                    ...alerts,
                    {
                        text:t("noKeyFound"),
                        style:"alert-error"
                    }
                ])
            }else{
                setKeyValue(response);
                setParentAlerts([
                    ...parentAlerts,
                    {
                        text:t("keyFoundAlert"),
                        style:"alert-success"
                    }
                ])
                setIsVisible(false);
            }
        }
        
    }

  useEffect(() => {
    if (!modalRef.current) {
        return;
      }
      isVisible ? modalRef.current.showModal() : modalRef.current.close();
  }, [isVisible]);
    return (
      <dialog ref={modalRef} id="my_confirm_modal" className="modal" onCancel={handleESC} >
        <div className="modal-box w-11/12 max-w-6xl relative">
            <FontAwesomeIcon className="absolute top-5 right-5 cursor-pointer hover:opacity-50" icon={faXmark} onClick={e=>setIsVisible(false)} />
            <TextInput labelText={t("searchKeyQueryLabel")} placeholder={t("searchKeyQueryPlaceholder")} icon={faMagnifyingGlass} value={searchQuery} setOnChange={setSearchQuery} />
            <div className="flex gap-2 mx-0">
                <button className="btn btn-info" onClick={handleQuery}>{t("search")}</button>
                <button className="btn" onClick={()=>{setIsVisible(false)}}>{t("cancel")}</button>
            </div>
            
          
        </div>
        <Alert alerts={alerts} setAlerts={setAlerts} />

      </dialog>
    )
}
