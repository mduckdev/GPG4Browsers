import CertificationsTable from "@src/components/CertificationsTable";
import { KeyDetailsTabProps } from "@src/types";
import { PublicKey, SignaturePacket, User } from "openpgp";
import React from "react";
import { useTranslation } from "react-i18next";
export default function AllUsers({selectedKey}:KeyDetailsTabProps) {
  const { t } = useTranslation();
    
    return(
        <div>
        {
            selectedKey.users.map((e:User,index:number)=>{
                return(
                    <div className="collapse collapse-arrow bg-base-200 my-3" key={index}>
                        <input type="radio" name="my-accordion-2"  />
                        <div className="collapse-title text-xl font-medium">{e.userID?.userID}</div>
                        <div className="collapse-content">
                            <p>{t("selfCertifications")}:</p>
                            <CertificationsTable certifications={e.selfCertifications} user={e}/>
                            <p>{t("otherCertifications")}:</p>
                            <CertificationsTable certifications={e.otherCertifications} user={e}/>

                        </div>
                    </div>
                )
            })
        }
        </div>
        
        
    )
}