import { RootState, useAppSelector } from "@src/redux/store";
import { CertificationsTableProps, UserCertificationsRow } from "@src/types";
import {  uint8ArrayToHex, verifyCertification } from "@src/utils";
import { BasePublicKeyPacket, Key, PacketList, PublicKey, PublicKeyPacket, PublicSubkeyPacket, SecretKeyPacket, SecretSubkeyPacket, SignaturePacket, enums, readKey } from "openpgp";
import React, { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
export default function CertificationsTable({certifications,user}:CertificationsTableProps) {
    const { t } = useTranslation();
    const [certificationsTsx,setCertificationsTsx] = useState<ReactNode>();
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);

    const verifyCertifications = async(certifications:SignaturePacket[])=>{
        const certObject:UserCertificationsRow[]=[];
        const publicKeys:Key[] = await Promise.all(pubKeysList.map(async (e)=>await readKey({armoredKey:e.keyValue})))
        for await(const cert of certifications){
            if(!cert.signatureType){
                continue;
            }
            if(!cert.signatureData){
                continue;
            }
            const tempObject:UserCertificationsRow = {
                status:t("couldntVerifyCertification"),
                keyFingerprint:uint8ArrayToHex(cert.issuerFingerprint || new Uint8Array()).toUpperCase(),
                keyID:cert.issuerKeyID.toHex().toUpperCase(),
                isValid:false,
                issuer:cert.signersUserID || ""
            }
            const isVerifiedCert = await verifyCertification(user,publicKeys as PublicKey[], cert);
            if(isVerifiedCert){
                tempObject.isValid=true;
                tempObject.status=t("validCertification");
                if(tempObject.issuer === ""){
                    tempObject.issuer = pubKeysList.filter(e=>e.fingerprint===uint8ArrayToHex(cert.issuerFingerprint || new Uint8Array()))[0]?.userID || ""
                }
            }

            certObject.push(tempObject);
        }


        const result = await Promise.all(certObject.map(async (cert:UserCertificationsRow,index:number)=>{
            
            return (
             <tr key={index} className={`${cert.isValid?("text-success"):("text-error")}`}>
                <td>{cert.status}</td>
                <td>{cert.keyFingerprint}</td>
                <td>{cert.keyID}</td>
                <td>{cert.issuer}</td>
             </tr>
         )
         }));
         setCertificationsTsx(result)
         return result;
    }

    useEffect(() => {
        verifyCertifications(certifications)
    }, [certifications]);
        return (
        <table className="table table-zebra">
            <thead>
                <tr>
                    <th>{t("info")}</th>
                    <th>{t("keyFingerprint")}</th>
                    <th>{t("keyID")}</th>
                    <th>{t("issuer")}</th>
                </tr>
            </thead>
            <tbody>
            {
                certificationsTsx
            }
            </tbody>
        </table>
        )
}