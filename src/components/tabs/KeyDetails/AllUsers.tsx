import { KeyDetailsTabProps } from "@src/types";
import { User } from "openpgp";
import React, {  ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
export default function AllUsers({selectedKey}:KeyDetailsTabProps) {
    const { t } = useTranslation();

    const [rows,setRows] = useState<ReactNode>()
    const getRows = async (users:User[])=>{
    
        for await(const user of users){
            console.log(user);
        }
        setRows(<tr></tr>)
        return <tr></tr>;
    }

    useEffect(() => {
        getRows(selectedKey.users)
      }, [selectedKey]);
    return (
    <table className="table table-zebra">
        <thead>
            <tr>
                <th>{t("primaryKeyFlag")}</th>
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
    )
}