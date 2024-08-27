import { KeyDetailsTabProps } from "@src/types";
import { publicKeyEnumToReadable } from "@src/utils";
import React from "react";
export default function BasicKeyInfo({selectedKey}:KeyDetailsTabProps) {
    return (
    <div>
        <p>Name: <span className="font-bold">{selectedKey.primaryName}</span></p>
            <p>Email: <span className="font-bold">{selectedKey.primaryEmail}</span></p>
            <p>Is this a private key? {selectedKey.isPrivate?(<span className="font-bold">Yes</span>):(<span className="font-bold">No</span>)}</p>
            <p>Creation date: <span className="font-bold"> {selectedKey.creationDate.toLocaleDateString()}</span></p>
            <p>Expiration date: <span className={`font-bold ${(selectedKey.expirationDate==="Invalid/revoked key")?("text-error"):("text-success")}`}>{selectedKey.expirationDate}</span></p>
            <p>Algorithm: <span className="font-bold">{`${publicKeyEnumToReadable(selectedKey.algorithm.algorithm)} ${selectedKey.algorithm.bits?(`(${selectedKey.algorithm.bits} bits)`):('')} ${selectedKey.algorithm.curve?(`(${selectedKey.algorithm.curve})`):('')}`}</span></p>
            <p>Key fingerprint: <span className="font-bold">{selectedKey.fingerprint.toUpperCase()}</span></p>
    </div>
    )
}