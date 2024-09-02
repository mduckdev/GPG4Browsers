import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { RootState, useAppDispatch, useAppSelector } from "@src/redux/store";
import { IPrivateKey, addPrivateKey } from "@src/redux/privateKeySlice";
import {  Key,PrimaryUser, readKeys} from "openpgp"
import { IPublicKey, addPublicKey } from "@src/redux/publicKeySlice";
import { MainProps, alert, file, keyUpdates, sectionsWithPreviousInterface } from "@src/types";
import Alert from "../Alert";
import KeyUpdateModal from "../modals/KeyUpdateModal";
import { useTranslation } from "react-i18next";
import { handleDataLoaded, handleDataLoadedOnDrop } from "@src/utils";
import KeyGeneration from "../modals/KeyGeneration";
import SearchKeysModal from "../modals/SearchKeyModal";


export default function AddKey({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const privateKeysList:IPrivateKey[] = useAppSelector((state:RootState)=>state.privateKeys);
    const publicKeysList:IPublicKey[] = useAppSelector((state:RootState)=>state.publicKeys);
    
    const [selectedFiles, setSelectedFiles] = useState<file[]>([])


    const [keyValue,setKeyValue] = useState<string>("");
    const [alerts,setAlerts] = useState<alert[]>([]);
    const [keysToConfirm,setKeysToConfirm] = useState<keyUpdates[]>([]);

    const [isConfirmModalVisible,setIsConfirmModalVisible] = useState<boolean>(false);
    const [isKeyGenerationVisible,setIsKeyGenerationVisible] = useState<boolean>(false);
    const [isSearchModalVisible,setIsSearchModalVisible] = useState<boolean>(false);




    const saveToKeyring = async (confirmedKeysList?:Key[])=>{
        let keys:Key[]|null  = null;
        let unconfirmedKeysList:keyUpdates[]=[];
        let allKeysUnique=true;
        if(!confirmedKeysList){
            keys= await readKeys({ armoredKeys: keyValue }).catch(e => { console.error(e); return null });
            if(selectedFiles.length>0){
                for await(const file of selectedFiles){
                    const keysFromBinaryFile = await readKeys({ binaryKeys: file.data }).catch(e => { console.error(e); return null });
                    const keysFromArmoredFile = await readKeys({ armoredKeys: (new TextDecoder().decode(file.data)) }).catch(e => { console.error(e); return null });

                    if(keysFromBinaryFile && keys){
                        keys = keys.concat(keysFromBinaryFile);
                    }else if(keysFromBinaryFile && !keys){
                        keys = keysFromBinaryFile;
                    }else if(keysFromArmoredFile && keys){
                        keys = keys.concat(keysFromArmoredFile);
                    }else if(keysFromArmoredFile && !keys){
                        keys = keysFromArmoredFile;
                    }
                }
            }
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
            setIsConfirmModalVisible(true);
            return;
        }

        

        for await(const key of keys){
            
            const keyFingerprint = key.getFingerprint();
            const userID:PrimaryUser|null = await key.getPrimaryUser().catch(e=>{console.error(e);return null});
            const name:string = userID?.user.userID?.name || "";
            const email:string = userID?.user.userID?.email || "";
            const userIDString:string = userID?.user.userID?.userID || "";
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
    <KeyUpdateModal title={t("confirmUpdatingTheKey")} text="" isVisible={isConfirmModalVisible} setIsVisible={setIsConfirmModalVisible} keys={keysToConfirm} onConfirm={saveToKeyring} onClose={()=>{}} />
    <SearchKeysModal isVisible={isSearchModalVisible} setKeyValue={setKeyValue} setParentAlerts={setAlerts} parentAlerts={alerts} setIsVisible={setIsSearchModalVisible} onConfirm={() => setActiveSection(previousTab)} onClose={()=>{}}/>
    <KeyGeneration isVisible={isKeyGenerationVisible} setIsVisible={setIsKeyGenerationVisible} onConfirm={() => setActiveSection(previousTab)} onClose={()=>{}}/>
        <h2 className="text-2xl font-bold mb-4 text-center">{t("addToKeyring")}</h2>
        <label htmlFor="keyValue" className="text-lg mb-2">{t("pasteArmoredKey")}:</label>
        <textarea required value={keyValue} onChange={(e)=>{setKeyValue(e.target.value)}} id="keyValue" className="w-full h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 rounded-md py-2 px-4 mb-4 "></textarea>
        {
        isPopup?(null):(
                        <div className="flex w-full flex-col border-opacity-50  mb-4">
                            <div className="divider">{t("or")}</div>
                                <input 
                                className="file-input file-input-bordered w-full max-w-xs file-input-info"
                                draggable={true} type="file" multiple={true}
                                onChange={(e)=>setSelectedFiles(handleDataLoaded(e) || [])}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const files = Array.from(e.dataTransfer.files);
                                    setSelectedFiles(handleDataLoadedOnDrop(files) || []);
                                }}
                                />
                        </div>
        )
        }
        <div className={`buttons ${isPopup?('w-3/5'):('w-1/5')}`}>
            <button id="saveButton" className="w-full btn btn-info mb-4" onClick={()=> saveToKeyring()}>{t("save")}</button>
            <button className="w-full btn btn-info mb-4" onClick={()=>{setIsSearchModalVisible(true)}}><FontAwesomeIcon icon={faMagnifyingGlass} /> {t("searchOnKeyServer")}</button>
            <button className="w-full btn btn-success mb-4" onClick={()=>{setIsKeyGenerationVisible(true)}}>{t("generateNewKey")}</button>
            <button id="backButton" className="w-full btn mb-4" onClick={() => setActiveSection(previousTab)}><FontAwesomeIcon icon={faArrowLeft} /> {t("back")}</button>
        </div>
                <Alert alerts={alerts} setAlerts={setAlerts}/>
    </div>
    )
}