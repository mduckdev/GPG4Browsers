import { faCircleCheck, faCircleExclamation, faCircleInfo, faCircleXmark, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { alert, alertProps } from "@src/types";
import React, { ReactNode } from "react";
export default function Alert({alerts,setAlerts}:alertProps) {

    const handleDismiss = (index: number) => {
        const updatedAlerts = [...alerts];
        updatedAlerts.splice(index, 1);
        setAlerts(updatedAlerts);
    };
    const getIcon = (alert:alert):ReactNode=>{
        if(alert.style === "error"){
            return <FontAwesomeIcon icon={faCircleXmark} />
        }
        if(alert.style === "success"){
            return <FontAwesomeIcon icon={faCircleCheck} />
        }
        if(alert.style === "info"){
            return <FontAwesomeIcon icon={faCircleInfo} />

        }
        if(alert.style === "warning"){
            return <FontAwesomeIcon icon={faCircleExclamation} />
        }
        return null;
    }

    return (
        <div className="fixed bottom-2 flex flex-col gap-2 z-50 left-1/2 transform -translate-x-1/2">
            {
                alerts.map((e:alert,index:number)=>(
            <div role="alert" className={`alert ${"alert-"+e.style} flex relative`} key={index}>
                <FontAwesomeIcon className="absolute top-2 right-2 cursor-pointer hover:opacity-50" icon={faXmark} onClick={e=>handleDismiss(index)} />
                {
                    getIcon(e)
                }
                <span className="mr-5">{e.text}</span>
            </div>
                ))
            }
            
            
        </div>
    )
}