import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import { IPrivateKey, addPrivateKey } from "@src/redux/privateKeySlice";
import {  Key,PrimaryUser, readKeys} from "openpgp"
import { IPublicKey, addPublicKey } from "@src/redux/publicKeySlice";
import { alert, keyUpdates, sectionsWithPreviousInterface } from "@src/types";
import Alert from "../Alert";
import KeyUpdateModal from "../KeyUpdateModal";
import { useTranslation } from "react-i18next";


export default function AddKey({activeSection,previousTab,setActiveSection}:sectionsWithPreviousInterface) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const privateKeysList:IPrivateKey[] = useAppSelector((state:RootState)=>state.privateKeys);
    const publicKeysList:IPublicKey[] = useAppSelector((state:RootState)=>state.publicKeys);


    const [keyValue,setKeyValue] = useState<string>("");
    const [alerts,setAlerts] = useState<alert[]>([]);
    const [keysToConfirm,setKeysToConfirm] = useState<keyUpdates[]>([]);

    const [isModalVisible,setIsModalVisible] = useState<boolean>(false);


    const saveToKeyring = async (confirmedKeysList?:Key[])=>{
        let keys:Key[]|null  = null;
        let unconfirmedKeysList:keyUpdates[]=[];
        let allKeysUnique=true;
        if(!confirmedKeysList){
            keys= await readKeys({ armoredKeys: keyValue }).catch(e => { console.error(e); return null });
            if(keys){
                for await(const key of keys){
                    let isUnique:boolean;
                    const keyFingerprint = key.getFingerprint();
                    let isUniquePublic = publicKeysList.filter(e=>e.fingerprint===keyFingerprint).length===0;
                    let isUniquePrivate = privateKeysList.filter(e=>e.fingerprint===keyFingerprint).length===0;

                    isUnique =  isUniquePublic && isUniquePrivate;
                    if(!isUnique){
                        allKeysUnique=false;
                        unconfirmedKeysList.push({
                            key:key,
                            confirmed:false,
                            isUniquePublic:isUniquePublic,
                            isUniquePrivate:isUniquePrivate
                        })
                    }else{
                        unconfirmedKeysList.push({
                            key:key,
                            confirmed:true,
                            isUniquePublic:isUniquePublic,
                            isUniquePrivate:isUniquePrivate
                        })
                    }
                }
            }
            
        }else{
            keys=confirmedKeysList;
        }
        if(!keys || keys.length===0){
            setAlerts([
                ...alerts,
                {
                    text:t("errorFailedToReadKeys"),
                    style:"alert-error"
                }
            ])
            return false;
        }
        
        if(!allKeysUnique && !confirmedKeysList){
            setKeysToConfirm(unconfirmedKeysList);
            setIsModalVisible(true);
            return;
        }

        

        for await(const key of keys){
            
            const keyFingerprint = key.getFingerprint();
            const userID:PrimaryUser = await key.getPrimaryUser();
            const name:string = userID.user.userID?.name || "";
            const email:string = userID.user.userID?.email || "";
            const userIDString:string = userID.user.userID?.userID || "";
            if(key.isPrivate()){
                const pubKeyFromPrivKey = key.toPublic();
    
                dispatch(addPrivateKey({keyValue:key.armor(),userID:userIDString,name:name,email:email, fingerprint:keyFingerprint}));
                dispatch(addPublicKey({keyValue:pubKeyFromPrivKey.armor(),userID:userIDString,name:name,email:email, fingerprint:pubKeyFromPrivKey.getFingerprint()}));
                
            }else{
                dispatch(addPublicKey({keyValue:key.armor(), userID:userIDString,name:name,email:email, fingerprint:keyFingerprint}));
            }
        }
        
        
        setActiveSection(previousTab);
    }

    return (
    <div className="p-4 flex flex-col items-center">
    <KeyUpdateModal title={t("confirmUpdatingTheKey")} text="" isVisible={isModalVisible} setIsVisible={setIsModalVisible} keys={keysToConfirm} onConfirm={saveToKeyring} onClose={()=>{}} />

        <h2 className="text-2xl font-bold mb-4 text-center">{t("addToKeyring")}</h2>
        <label htmlFor="keyValue" className="text-lg mb-2">{t("pasteArmoredKey")}:</label>
        <textarea required value={keyValue} onChange={(e)=>{setKeyValue(e.target.value)}} id="keyValue" className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 "></textarea>
        <button id="saveButton" className="w-full btn btn-info mb-4" onClick={()=> saveToKeyring()}>{t("save")}</button>
        <button id="backButton" className="w-full btn mb-4" onClick={() => setActiveSection(previousTab)}><FontAwesomeIcon icon={faArrowLeft} /> {t("back")}</button>
                <Alert alerts={alerts} setAlerts={setAlerts}/>
    </div>
    )
}