import { KeyDetailsTabProps } from "@src/types";
import { publicKeyEnumToReadable } from "@src/utils";
import React from "react";
import { useTranslation } from "react-i18next";
export default function BasicKeyInfo({selectedKey}:KeyDetailsTabProps) {
    const { t } = useTranslation();
    return (
    <div>
        <p>{t("name")}: <span className="font-bold">{selectedKey.primaryName}</span></p>
            <p>{t("email")}: <span className="font-bold">{selectedKey.primaryEmail}</span></p>
            <p>{t("isPrivateKeyAvailable")}? {selectedKey.isPrivate?(<span className="font-bold">{t("yes")}</span>):(<span className="font-bold">{t("no")}</span>)}</p>
            <p>{t("creationDate")}: <span className="font-bold"> {selectedKey.creationDate.toLocaleDateString()}</span></p>
            <p>{t("expirationDate")}: <span className={`font-bold ${(selectedKey.expirationDate==="❌")?("text-error"):("text-success")}`}>{selectedKey.expirationDate}</span></p>
            <p>{t("algorithm")}: <span className="font-bold">{`${publicKeyEnumToReadable(selectedKey.algorithm.algorithm)} ${selectedKey.algorithm.bits?(`(${selectedKey.algorithm.bits} bits)`):('')} ${selectedKey.algorithm.curve?(`(${selectedKey.algorithm.curve})`):('')}`}</span></p>
            <p>{t("keyFingerprint")}: <span className="font-bold">{selectedKey.fingerprint.toUpperCase()}</span></p>
    </div>
    )
}