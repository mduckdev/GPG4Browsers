import { RootState, useAppSelector } from "@src/redux/store";
import { sectionsPropsInterface } from "@src/types";
import { getSignatureInfo } from "@src/utils";
import { CleartextMessage, Key, VerifyMessageResult, readCleartextMessage, readKey, verify } from "openpgp";
import React, { useState } from "react";
export default function ValidatingSignatures({activeSection,setActiveSection}:sectionsPropsInterface) {
    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);

    const [signedMessage,setSignedMessage] = useState<string>("");
    const [isMessageVerified,setIsMessageVerified] = useState<boolean>(false);
    const [signatureMessages,setSignatureMessages] = useState<string>("");

    const verifySignature = async ()=>{
        const signatureParsed:CleartextMessage|null = await readCleartextMessage({cleartextMessage:signedMessage}).catch(e => { console.error(e); return null });
        if(!signatureParsed){
            setSignatureMessages("Failed to parse the message.");
            setIsMessageVerified(false);
            return;
        }
        const pubKeys:Key[] = await Promise.all(pubKeysList.map(async e=>await readKey({armoredKey:e.keyValue})))

        const signatureInfo:VerifyMessageResult<string> | null = await verify({message:signatureParsed,verificationKeys:pubKeys}).catch(e => { console.error(e); return null });

        if(!signatureInfo){
            setSignatureMessages("Failed to check signatures.");
            setIsMessageVerified(false);
            return;
        }

        const results = await getSignatureInfo(signatureInfo);

        if(!results){
            setSignatureMessages("Message authenticity could not be verified.");
            setIsMessageVerified(false);
            return;
        }
        

        setIsMessageVerified(true)
        setSignatureMessages(results.join("\n"))

    }

    return (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Signatures</h2>
        <div className="w-full flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium">Signed message</label>
            <textarea id="message"
                className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={signedMessage} onChange={(e)=>{setSignedMessage(e.target.value)}}></textarea>
            <button 
                className="mt-4 btn btn-info" onClick={verifySignature}>Verify</button>
        </div>
        <p className={isMessageVerified?("text-info"):("text-error")}>{signatureMessages}</p>
    </div>
    )
}