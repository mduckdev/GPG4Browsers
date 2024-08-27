import { KeyDetailsTabProps } from "@src/types";
import { expirationDateToString, expirationDateToStyle, publicKeyEnumToReadable } from "@src/utils";
import { AllowedKeyPackets, AnyKeyPacket, BasePublicKeyPacket, Key, KeyID, PacketList, PublicKeyPacket, PublicSubkeyPacket, SecretKeyPacket, SecretSubkeyPacket, SignaturePacket, Subkey,enums, readKey, readKeys } from "openpgp";
import React, {  ReactNode, useEffect, useState } from "react";
export default function AllKeys({selectedKey}:KeyDetailsTabProps) {
    const [rows,setRows] = useState<ReactNode>()

    const uint8ToFlagStrings = (flag:Uint8Array):string[]=>{
        const results:string[]=[]
        const descriptions = ["Certify","Sign","Encrypt","Encrypt","Private key is split", "Authenticate", "Private component of this key is in possesion of more than one person"] //https://www.rfc-editor.org/rfc/rfc9580.html#name-key-flags
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

    const getKeyFlags =  (key:Key|Subkey)=>{
        const results:string[]=[]
        if(!("getPrimaryUser" in key)){
            key.bindingSignatures.forEach((e)=>{
                results.push(uint8ToFlagStrings(e.keyFlags || new Uint8Array()).join(" "))
            })
        }else{
            results.push("Certify")
        }
        return results
        
    }
    const getRows = async (keys:(Key|Subkey)[])=>{
        let masterKey:Key;
        
        const result = await Promise.all(keys.map(async (key:Key|Subkey,index:number)=>{
            if("getPrimaryUser" in key){
                masterKey=key
            }
            
           return (
            <tr key={index}>
                {
                    ("getPrimaryUser" in key)?(
                        <td>Yes</td>
                    ):(
                        <td>No</td>
                    )
                }
                <td>{key.getKeyID().toHex().toUpperCase()}</td>
                <td>{key.getCreationTime().toLocaleDateString()}</td>
                <td className={expirationDateToStyle((await key.getExpirationTime()))}>{expirationDateToString((await key.getExpirationTime()))}</td>
                <td>{getKeyFlags(key)}</td>

            </tr>
        )
        }));
        setRows(result)
        return result;
    }
    useEffect(() => {
        getRows(selectedKey.allKeys)
      }, [selectedKey]);
    return (
    <table className="table table-zebra">
        <thead>
            <tr>
                <th>Primary key</th>
                <th>Key ID</th>
                <th>Creation date</th>
                <th>Expiration date</th>
                <th>Usage</th>
            </tr>
        </thead>
        <tbody>
        {
            rows
        }
        </tbody>
    </table>
    )
}