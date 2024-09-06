import { RootState, useAppSelector } from "@src/redux/store";
import { MainProps, keyInfo } from "@src/types";
import {  mergeKeysLists, parseToKeyinfoObject } from "@src/utils";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TextInput from "../TextInput";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import KeyDetailsModal from "../modals/KeyDetailsModal";
export default function KeysManagment({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();

    const privateKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const publicKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const [mergedKeysList,setMergedKeysList] = useState<keyInfo[]>([]);
    const [selectedKey,setSelectedKey] = useState<keyInfo>();
    const [searchQuery,setSearchQuery] = useState<string>("");


    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);

    const setupKeys = async()=>{
        const keys = await mergeKeysLists(publicKeysList,privateKeysList);
        const keysInfo = await parseToKeyinfoObject(keys,t);
        setMergedKeysList(keysInfo);
    }
    useEffect(()=>{
        setupKeys()
    },[])
    
    const handleConfirm = async ()=>{

    }
   
    return (
    <div className={`overflow-auto mt-2 mb-12 ${isPopup?('table-xs'):('table-md')}`}>
        {
            selectedKey?(
                <KeyDetailsModal isVisible={isModalVisible} setIsVisible={setIsModalVisible} selectedKey={selectedKey} onConfirm={handleConfirm} />
            ):(null)
        }
        <TextInput className="mx-auto" labelText="" placeholder={t("filterLocalKeysPlaceholder")} icon={faMagnifyingGlass} value={searchQuery} setOnChange={setSearchQuery} />

        <table className="table table-zebra">
            {/* head */}
            <thead>
                <tr>
                    <th>{t("name")}</th>
                    <th>{t("email")}</th>
                    <th>{t("keyFingerprint")}</th>
                    <th>{t("creationDate")}</th>
                    <th>{t("expirationDate")}</th>
                    <th>{t("manage")}</th>
                </tr>
            </thead>
            <tbody>
            {/* row 1 */}
            {mergedKeysList.map((currentKey: keyInfo ,index:number) => {
                if(searchQuery==="" || 
                    currentKey.primaryName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    currentKey.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    currentKey.fingerprint.toLowerCase().includes(searchQuery.toLowerCase())){
                    return(
                        <tr key={index}>
                            <td>{currentKey.primaryName}</td>
                            <td>{currentKey.primaryEmail}</td>
                            <td>{currentKey.fingerprint}</td>
                            <td>{currentKey.creationDate.toLocaleDateString()}</td>
                            <td className={(currentKey.isExpired)?("text-error"):("text-success")}>{currentKey.expirationDate}</td>
                            <td><button className="btn btn-info" onClick={()=>{setSelectedKey(currentKey);setIsModalVisible(true);}}>{t("details")}</button></td>
                        </tr>
                    )
                }else {
                    return null;
                }
            })}
            </tbody>
        </table>
        <div className="flex justify-end m-5">
            <button className="btn btn-success" onClick={()=>{setActiveSection("AddKey")}}>{t("addNewKey")}</button>
        </div>
    </div>
    )
}