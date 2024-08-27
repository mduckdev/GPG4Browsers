import { IPublicKey } from "@src/redux/publicKeySlice";
import { RootState, useAppSelector } from "@src/redux/store";
import { MainProps, keyInfo } from "@src/types";
import { convertUint8ToUrl, mergeKeysLists, parseToKeyinfoObject } from "@src/utils";
import { Key, PrimaryUser } from "openpgp";
import React, { useEffect, useState } from "react";
export default function KeysManagment({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const privateKeysList = useAppSelector((state:RootState)=>state.privateKeys);
    const publicKeysList = useAppSelector((state:RootState)=>state.publicKeys);
    const [mergedKeysList,setMergedKeysList] = useState<keyInfo[]>([]);
    const setupKeys = async()=>{
        const keys = await mergeKeysLists(privateKeysList,publicKeysList);
        const keysInfo = await parseToKeyinfoObject(keys);
        setMergedKeysList(keysInfo);
    }
    useEffect(()=>{
        setupKeys()
    },[])
    return (
    <div className={`overflow-auto mt-2 mb-12 ${isPopup?('table-xs'):('table-md')}`}>
        <table className="table table-zebra">
            {/* head */}
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Fingerprint</th>
                    <th>Creation date</th>
                    <th>Expiration date</th>
                    <th>Manage</th>
                </tr>
            </thead>
            <tbody>
            {/* row 1 */}
            {mergedKeysList.map((currentKey: keyInfo ,index:number) => (
                <tr key={index}>
                    <td>{currentKey.primaryName}</td>
                    <td>{currentKey.primaryEmail}</td>
                    <td>{currentKey.fingerprint}</td>
                    <td>{currentKey.creationDate.toLocaleDateString()}</td>
                    <td className={(currentKey.expirationDate==="Invalid/revoked key")?("text-error"):("text-info")}>{currentKey.expirationDate}</td>
                    <td><button className="btn btn-info">Manage key</button></td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
    )
}