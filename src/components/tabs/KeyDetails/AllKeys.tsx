import SubkeyGenerationModal from "@src/components/modals/SubkeyGenerationModal";
import { KeyDetailsTabProps, keyRowInfo } from "@src/types";
import { expirationDateToString, expirationDateToStyle } from "@src/utils";
import { Key, Subkey} from "openpgp";
import React, {  ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
export default function AllKeys({selectedKey,setParentVisible}:KeyDetailsTabProps) {
    const { t } = useTranslation();

    const [rows,setRows] = useState<ReactNode>()

    const [isSubkeyGenerationVisible,setIsSubkeyGenerationVisible] = useState<boolean>(false);


    const handleAddNewSubkey = ()=>{
        if(setParentVisible){
            setParentVisible(false);
        }
        setIsSubkeyGenerationVisible(true);
    }
    
    const uint8ToFlagStrings = (flag:Uint8Array):string[]=>{
        const results:string[]=[]
        const descriptions = [t("certifyFlag"),t("signFlag"),t("encryptFlag"),t("encryptFlag"),t("privKeySplitFlag"), t("authenticateFlag"), t("privKeyMoreThanOnePersonFlag")] //https://www.rfc-editor.org/rfc/rfc9580.html#name-key-flags
        for (let i = 0; i < flag.length; i++) {
            if(i==1){
                switch(flag[i]){
                    case 4:
                        results.push("ADSK");
                        continue
                    case 8:
                        results.push("Timestamping");
                        continue
                    default:
                        continue
                }
            }

            let j=flag[i];
            let iteration=0;
            while(j>0){
                if(j%2===1 && (results.indexOf(descriptions[iteration]) === -1)){
                    results.push(descriptions[iteration]);
                }
                iteration++;
                j=Math.floor(j/2);
            }
            
        }
        return results
    }

    const getKeyFlags =  async (key:Key|Subkey)=>{
        let results:string[]=[]
        if(!("getPrimaryUser" in key)){
            results.push(t("subkeyFlag"))
            key.bindingSignatures.forEach((e)=>{
                results = results.concat(uint8ToFlagStrings(e.keyFlags || new Uint8Array()))
            })
        }else{
            results.push(t("primaryKeyFlag"));
            const primaryUser = (await key.getPrimaryUser().catch(e=>{console.error(e);return null}));
            if(primaryUser){
                results = results.concat(uint8ToFlagStrings(primaryUser.selfCertification.keyFlags || new Uint8Array()))
            }
        }
        return results
        
    }
    const getRows = async (keys:(Key|Subkey)[])=>{
        let masterKey:Key;
        const keyInformations:keyRowInfo[] = [];
        for await(const key of keys){
            let isCurrentKeyValid = false;
            if("getPrimaryUser" in key){
                masterKey=key
                try{
                   await key.verifyPrimaryKey();
                    isCurrentKeyValid=true;
                }catch(e){
                    console.error(e);
                }
            }else{
                try{
                    await key.verify()
                    isCurrentKeyValid=true;
                }catch(e){
                    console.error(e);
                }
            }
            keyInformations.push({
                isValid:isCurrentKeyValid,
                keyID:key.getKeyID(),
                creationDate:key.getCreationTime(),
                expirationDate:(await key.getExpirationTime()),
                keyFlags:await getKeyFlags(key)
            })

        }

        const result = await Promise.all(keyInformations.map(async (key:keyRowInfo,index:number)=>{
            
           return (
            <tr key={index}>
                <td className={`${key.isValid?("text-success"):("text-error")}`}>{key.isValid?(t("yes")):(t("no"))}</td>
                <td>{key.keyID.toHex().toUpperCase()}</td>
                <td>{key.creationDate.toLocaleDateString()}</td>
                <td className={expirationDateToStyle(key.expirationDate)}>{expirationDateToString(key.expirationDate,t)}</td>
                <td>{key.keyFlags.join(", ")}</td>

            </tr>
        )
        }));
        setRows(result)
        return result;
    }
    useEffect(() => {
        getRows(selectedKey.allKeys);

      }, [selectedKey]);
    return (
    <div>
        {
            selectedKey.isPrivate?(
                <SubkeyGenerationModal selectedKey={selectedKey} isVisible={isSubkeyGenerationVisible} setIsVisible={setIsSubkeyGenerationVisible} onConfirm={()=>{}}/>
            ):(null)
        }
        <table className="table table-zebra">
            <thead>
                <tr>
                    <th>{t("isKeyValid")}</th>
                    <th>{t("keyID")}</th>
                    <th>{t("creationDate")}</th>
                    <th>{t("expirationDate")}</th>
                    <th>{t("type")}</th>
                </tr>
            </thead>
            <tbody>
            {
                rows
            }
            </tbody>
        </table>
        {
            selectedKey.isPrivate?(
                <div className="flex gap-2 mx-0 mt-2">
                    <button className="btn btn-success" onClick={handleAddNewSubkey}>{t("addNewSubkey")}</button>
                </div>
            ):(null)
        }
        
    </div>
    
    )
}