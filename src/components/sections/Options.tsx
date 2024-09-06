import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import React, { useState } from "react";
import KeyDropdown from "../keyDropdown";
import { MainProps, preferences } from "@src/types";
import { useTranslation } from "react-i18next";
import { getPrivateKey } from "@src/utils";
import { setPreferences } from "@src/redux/preferencesSlice";
import { PrivateKey, readPrivateKey } from "openpgp";
export default function Options({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const preferences = useAppSelector((state:RootState)=>state.preferences);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);

    const [selectedPrivKey,setSelectedPrivKey] =  useState<string>(getPrivateKey(privKeysList,preferences));
    const [askAboutUpdatingKey,setAskAboutUpdatingKey] =  useState<boolean>(preferences.askAboutUpdatingKey);
    const [detectMessages,setDetectMessages] =  useState<boolean>(preferences.detectMessages);
    const [keyServers,setKeyServers] =  useState<string[]>(preferences.keyServers);

    const saveChanges = async ()=>{
        const key:PrivateKey|null = await readPrivateKey({armoredKey:selectedPrivKey}).catch(e=>{console.error(e);return null});
        const newPreferences:preferences = {
            defaultSigningKeyFingerprint:key?.getFingerprint() || "",
            askAboutUpdatingKey:askAboutUpdatingKey,
            detectMessages:detectMessages,
            keyServers:keyServers
        }
        dispatch(setPreferences(newPreferences));
       
    }

    return (
    <div className="p-6 mt-2 flex flex-col">
        <h1 className="font-bold">Options</h1>
        <div className="w-full">
            <KeyDropdown isActive={true} label={t("defaultSigningKey")} keysList={privKeysList} setSelectedKey={setSelectedPrivKey} setActiveSection={setActiveSection} />
        </div>
        <label  className="block text-sm font-medium ">{t("keyServers")}</label>
        <textarea className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" 
                    value={keyServers.join("\n")} onChange={(e)=>{setKeyServers(e.target.value.split("\n").filter(e=>e!==""))}}></textarea>
        <label className="label cursor-pointer flex gap-2">
            <span className="label-text">{t("askBeforeUpdatingKey")}</span>
            <input type="checkbox" className="checkbox" checked={askAboutUpdatingKey} onChange={(e)=>{setAskAboutUpdatingKey(e.target.checked);}}/>
        </label>
        <label className="label cursor-pointer flex gap-2">
            <span className="label-text">{t("detectMessages")}</span>
            <input type="checkbox" className="checkbox" checked={detectMessages} onChange={(e)=>{setDetectMessages(e.target.checked);}}/>
        </label>


        <button className="btn btn-info mt-2" onClick={saveChanges}>{t("saveChanges")}</button>
    </div>
    )
}