import { alert, alertProps } from "@src/types";
import React from "react";
export default function Alert({alerts,setAlerts}:alertProps) {

    const handleDismiss = (index: number) => {
        const updatedAlerts = [...alerts];
        updatedAlerts.splice(index, 1);
        setAlerts(updatedAlerts);
      };

    return (
        <div className="toast toast-center z-50">
            {
                alerts.map((e:alert,index:number)=>(
            <div className={`alert ${e.style}`} key={index}>
                <span>{e.text}</span>
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current hover:cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                onClick={() => handleDismiss(index)}
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
                ))
            }
            
            
        </div>
    )
}