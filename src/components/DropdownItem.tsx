import { IPrivateKey } from "@src/redux/privateKeySlice";
import { IPublicKey } from "@src/redux/publicKeySlice";
import { RootState, useAppSelector } from "@src/redux/store";
import { DropdownItemProps, KeyDropdownProps } from "@src/types";
import { getDropdownText } from "@src/utils";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function DropdownItem<T extends IPublicKey | IPrivateKey>({keyData,selectedKeys,setSelectedKeys,isCheckedDefault,setDropdownText}:DropdownItemProps<T>) {
    const { t } = useTranslation();
    const [isSelected,setIsSelected] = useState<boolean>(isCheckedDefault);
    const handleClick = ()=>{
        if(isSelected){ // if isSelected is true then remove item from list 
            const newKeys = selectedKeys.filter(e=>e.fingerprint !== keyData.fingerprint) as T[];
            setSelectedKeys(newKeys);
            if(newKeys.length>0){
                let lastKey = newKeys[newKeys.length-1];
                setDropdownText(lastKey.userID || keyData.fingerprint.toUpperCase());
            }else{
                setDropdownText(t("selectKey"));
            }
            setIsSelected(false);
        }else{ //if not selected, add to list
            const newKeys:T[] = [
                ...(selectedKeys),
                keyData as T
            ];
            setSelectedKeys(newKeys);
            setDropdownText(keyData.userID || keyData.fingerprint.toUpperCase());
            setIsSelected(true);
        }
    }
    return (
    <div className="flex gap-1 items-center block px-4 py-2 cursor-pointer rounded-md hover:bg-slate-200 dark:hover:bg-gray-800" onClick={handleClick} data-testid="DropdownItem">
        <input type="checkbox" className="checkbox" checked={isSelected} readOnly={true}/>
        {keyData.userID || keyData.fingerprint.toUpperCase()}
    </div>
    )
}