import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import React, { useState } from "react";
import KeyDropdown from "../keyDropdown";
import { MainProps, alert, preferences } from "@src/types";
import { useTranslation } from "react-i18next";
import { getPrivateKeys, getPublicKeys } from "@src/utils";
import { setPreferences } from "@src/redux/preferencesSlice";
import { PrivateKey, readPrivateKey } from "openpgp";
import Alert from "../Alert";
import { IPrivateKey } from "@src/redux/privateKeySlice";
import { IPublicKey } from "@src/redux/publicKeySlice";
export default function Options({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const preferences = useAppSelector((state:RootState)=>state.preferences);
    const privKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);


    const [selectedPrivKeys,setSelectedPrivKeys] =  useState<IPrivateKey[]>(getPrivateKeys(privKeysList,preferences) || []);
    const [selectedPubKeys,setSelectedPubKeys] =  useState<IPublicKey[]>(getPublicKeys(pubKeysList,preferences) || []);

    const [askAboutUpdatingKey,setAskAboutUpdatingKey] =  useState<boolean>(preferences.askAboutUpdatingKey);
    const [detectMessages,setDetectMessages] =  useState<boolean>(preferences.detectMessages);
    const [keyServers,setKeyServers] =  useState<string[]>(preferences.keyServers);
    const [alerts,setAlerts] = useState<alert[]>([]);

    const saveChanges = async ()=>{
        const newPreferences:preferences = {
            defaultSigningKeyFingerprints:selectedPrivKeys.map(e=>e?.fingerprint) || [],
            defaultEncryptionKeyFingerprints:selectedPubKeys.map(e=>e?.fingerprint) || [],
            askAboutUpdatingKey:askAboutUpdatingKey,
            detectMessages:detectMessages,
            keyServers:keyServers
        }
        dispatch(setPreferences(newPreferences));
       setAlerts([
        ...alerts,
        {
            text:t("successfullySaved"),
            style:"alert-success"
        }
       ])
    }


    return (
    <div className="p-6 mt-2 flex flex-col">
        <h1 className="font-bold">Options</h1>
        <div className="w-full">
            <KeyDropdown isActive={true} label={t("defaultSigningKeys")} selectedKeys={selectedPrivKeys} keysList={privKeysList} setSelectedKeys={setSelectedPrivKeys} setActiveSection={setActiveSection} />
        </div>
        <div className="w-full">
            <KeyDropdown isActive={true} label={t("defaultEncryptionKeys")} selectedKeys={selectedPubKeys} keysList={pubKeysList} setSelectedKeys={setSelectedPubKeys} setActiveSection={setActiveSection} />
        </div>
        <label  className="block text-sm font-medium ">{t("keyServers")}</label>
        <textarea className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" 
                    defaultValue={keyServers.join("\n")} onChange={(e)=>{setKeyServers(e.target.value.split("\n").filter(e=>e!==""))}}></textarea>
        <label className="label cursor-pointer flex gap-2">
            <span className="label-text">{t("askBeforeUpdatingKey")}</span>
            <input type="checkbox" className="checkbox" checked={askAboutUpdatingKey} onChange={(e)=>{setAskAboutUpdatingKey(e.target.checked);}}/>
        </label>
        <label className="label cursor-pointer flex gap-2">
            <span className="label-text">{t("detectMessages")}</span>
            <input type="checkbox" className="checkbox" checked={detectMessages} onChange={(e)=>{setDetectMessages(e.target.checked);}}/>
        </label>


        <button className="btn btn-info mt-2" onClick={saveChanges}>{t("saveChanges")}</button>
        <Alert alerts={alerts} setAlerts={setAlerts} />

    </div>
    )
}