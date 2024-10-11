import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import React, { useState } from "react";
import KeyDropdown from "../keyDropdown";
import { MainProps, alert, preferences } from "@src/types";
import { useTranslation } from "react-i18next";
import { getPrivateKeys, getPublicKeys, urlRegex } from "@src/utils";
import { setPreferences } from "@src/redux/preferencesSlice";
import Alert from "../Alert";
import { IPrivateKey } from "@src/redux/privateKeySlice";
import { IPublicKey } from "@src/redux/publicKeySlice";
import { languages } from "@src/locales";
import i18n from "@src/index";
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
    const [language,setLanguage] =  useState<string>(preferences.language);

    const [alerts,setAlerts] = useState<alert[]>([]);

    const saveChanges = async ()=>{
        const newPreferences:preferences = {
            defaultSigningKeyFingerprints:selectedPrivKeys.map(e=>e?.fingerprint) || [],
            defaultEncryptionKeyFingerprints:selectedPubKeys.map(e=>e?.fingerprint) || [],
            askAboutUpdatingKey:askAboutUpdatingKey,
            detectMessages:detectMessages,
            keyServers:keyServers,
            language:language
        }
        if(language in languages){
            i18n.changeLanguage(language)
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
    <div className="p-5 flex flex-col">
        <div className="w-full">
            <KeyDropdown  isActive={true} label={t("defaultSigningKeys")} selectedKeys={selectedPrivKeys} keysList={privKeysList} setSelectedKeys={setSelectedPrivKeys} setActiveSection={setActiveSection} />
        </div>
        <div className="w-full">
            <KeyDropdown  isActive={true} label={t("defaultEncryptionKeys")} selectedKeys={selectedPubKeys} keysList={pubKeysList} setSelectedKeys={setSelectedPubKeys} setActiveSection={setActiveSection} />
        </div>
        <label className="mt-1 block text-sm font-medium ">{t("keyServers")}</label>
        <textarea className="h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md p-2" 
            defaultValue={keyServers.join("\n")} 
            onChange={(e)=>{
                const urls = Array.from(e.target.value.split("\n")).filter((s: string) => {
                    const link = s.match(urlRegex);
                    return link;
                    });
                setKeyServers(urls.map(link => link.replace(/\/$/, '').trim()));
            }}>
            
        </textarea>

        <label className="mt-1 block text-sm font-medium ">{t("language")}</label>
        <select className="select select-info focus:outline-none w-full" onChange={(e)=>{setLanguage(e.target.value)}} defaultValue={preferences.language || "selectLanguage"}>
                <option value="selectLanguage"disabled>{t("selectLanguage")}</option>
                {
                Object.keys(languages).map((e,index)=>{
                return <option key={index} value={e}>{e}</option>
                })
                }
        </select>
        <label className="label cursor-pointer flex gap-2">
            <span className="label-text">{t("askBeforeUpdatingKey")}</span>
            <input type="checkbox" className="checkbox" checked={askAboutUpdatingKey} onChange={(e)=>{setAskAboutUpdatingKey(e.target.checked);}}/>
        </label>
        <label className="label cursor-pointer flex gap-2">
            <span className="label-text">{t("detectMessages")}</span>
            <input type="checkbox" className="checkbox" checked={detectMessages} onChange={(e)=>{setDetectMessages(e.target.checked);}}/>
        </label>


        <button className="btn btn-info" onClick={saveChanges}>{t("saveChanges")}</button>
        <Alert alerts={alerts} setAlerts={setAlerts} />

    </div>
    )
}