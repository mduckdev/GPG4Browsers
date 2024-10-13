import OutputTextarea from "@src/components/OutputTextarea";
import ShowFilesInTable from "@src/components/ShowFilesInTable";
import { RootState, useAppSelector } from "@src/redux/store";
import { MainProps, decryptedFile, file, sectionsPropsInterface } from "@src/types";
import { getSignatureInfo, handleDataLoaded, handleDataLoadedOnDrop, removeFileExtension, testFileExtension } from "@src/utils";
import { CleartextMessage, Key, Message, Signature, VerifyMessageResult, createMessage, readCleartextMessage, readKey, readMessage, readSignature, verify } from "openpgp";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
export default function ValidatingSignatures({activeSection,isPopup,previousTab,setActiveSection}:MainProps) {
    const { t } = useTranslation();

    const pubKeysList = useAppSelector((state:RootState)=>state.publicKeys);

    const [signedMessage,setSignedMessage] = useState<string>("");
    const [signedValue,setSignedValue] = useState<string>("");
    const [isMessageVerified,setIsMessageVerified] = useState<boolean>(false);
    const [signatureMessages,setSignatureMessages] = useState<string[]>([]);

    const [fileSignatures, setFileSignatures] = useState<file[]>([])
    const [checkedFiles, setCheckedFiles] = useState<decryptedFile[]>([])

    const [validatingInProgress,setValidatingInProgress] = useState<boolean>(false);


    const verifyData = async ()=>{
        const pubKeys:Key[] = await Promise.all(pubKeysList.map(async e=>await readKey({armoredKey:e.keyValue})))
        if(pubKeys.length===0){
            //show alert
            return;
        }
        verifyMessage(pubKeys);
        verifyFiles(pubKeys)
    }
    const verifyMessage = async (publicKeys:Key[])=>{
        if(signedMessage===""){
            return;
        }
        let signatureInfo:VerifyMessageResult<string> | null
        let signatureParsed:CleartextMessage|Message<string>|null = await readCleartextMessage({cleartextMessage:signedMessage}).catch(e => { console.error(e); return null });
        if(!signatureParsed){ // is not cleartext message
            signatureParsed = await readMessage({armoredMessage:signedMessage}).catch(e => { console.error(e); return null });
            if(!signatureParsed){ //is not cleartext or inline 
                setSignatureMessages([t("failedToParseTheMessage")]);
                setIsMessageVerified(false);
                return;
            }else{ //is inline
                 signatureInfo = await verify({message:signatureParsed,verificationKeys:publicKeys}).catch(e => { console.error(e); return null });
            }
        }else{ //is cleartext
            signatureInfo = await verify({message:signatureParsed,verificationKeys:publicKeys}).catch(e => { console.error(e); return null });
        }

        if(!signatureInfo){
            setSignatureMessages([t("failedToCheckSignatures")]);
            setIsMessageVerified(false);
            return;
        }


        const results = await getSignatureInfo(signatureInfo.signatures,publicKeys,t).catch(e=>{console.error(e);return null});

        setSignedValue(signatureInfo.data);
        setIsMessageVerified(results?true:false)
        setSignatureMessages(results?results:[t("messageUnathenticated")]);
    }
    const verifyFiles = async (publicKeys:Key[])=>{
        if(fileSignatures.length===0){
            return;
        }
        const newCheckedFiles:decryptedFile[] = [];

        setValidatingInProgress(true)
        for await(const currentFile of fileSignatures){

            if(!testFileExtension(currentFile.fileName)){ //if the file is not a signature file continue
                continue;
            }
            const signatureParsed:Signature|null = await readSignature({binarySignature:currentFile.data}).catch(e => { console.error(e); return null });
            const correspondingFile:file|undefined = fileSignatures.find(e=>removeFileExtension(currentFile.fileName)===e.fileName);
            let newCheckedFile:decryptedFile={
                data:currentFile.data,
                fileName:currentFile.fileName,
                signatureMessages:[],
                signatureStatus:"text-error"
            } ;
            
            if(!signatureParsed){
                newCheckedFile.signatureMessages.push(t("failedToParseTheFileSignature"));
                newCheckedFiles.push(newCheckedFile);
                continue;
            }
            if(!correspondingFile){
                newCheckedFile.signatureMessages.push(t("failedToFindCorrespondingFile"));
                newCheckedFiles.push(newCheckedFile);
                continue;
            }
            const correspondingFileParsed:Message<Uint8Array>|null = await createMessage({binary:correspondingFile.data,format:"binary"}).catch(e => { console.error(e); return null });
            if(!correspondingFileParsed){
                newCheckedFile.signatureMessages.push(t("failedToParseCorrespondingFile"));
                newCheckedFiles.push(newCheckedFile);
                continue;
            }

            const signatureInfo:VerifyMessageResult<Uint8Array> | null = await verify({message:correspondingFileParsed,signature:signatureParsed,format:"binary",verificationKeys:publicKeys}).catch(e => { console.error(e); return null });
    
            if(!signatureInfo){
                newCheckedFile.signatureMessages.push(t("failedToVerifyFile"));
                newCheckedFiles.push(newCheckedFile);
                continue;
            }
            let results = await getSignatureInfo(signatureInfo.signatures,publicKeys,t).catch(e=>{console.error(e);return null});
    
            let verified:boolean;
                
            if(!results){
                results=[t("messageUnathenticated")];
                verified=false;
            }else{
                verified=true;
            }
             newCheckedFile= {
                data:correspondingFile.data,
                fileName:correspondingFile.fileName,
                signatureMessages:results,
                signatureStatus:verified?"text-info":"text-error"
            } 
            newCheckedFiles.push(newCheckedFile);
        }
        setValidatingInProgress(false)
        setCheckedFiles(newCheckedFiles);
        
    }

    return (
    <div className="p-6" id="validatingSignatures">
        <div className="w-full flex flex-col">
            <label htmlFor="message" className="block text-sm font-medium">{t("signedMessage")}</label>
            <textarea id="message"
                className="mt-1 h-24 border border-gray-300 dark:border-gray-500 focus:outline-none focus:border-blue-500 p-2 rounded-md" value={signedMessage} onChange={(e)=>{setSignedMessage(e.target.value)}}></textarea>
            {
                    isPopup?(null):(
                        <div className="flex w-full flex-col border-opacity-50">
                            <div className="divider">{t("or")}</div>
                                <input 
                                className="file-input file-input-bordered w-full max-w-xs file-input-info"
                                draggable={true} type="file" multiple={true}
                                onChange={(e)=>setFileSignatures(handleDataLoaded(e) || [])}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const files = Array.from(e.dataTransfer.files);
                                    setFileSignatures(handleDataLoadedOnDrop(files) || []);
                                }}
                                />
                        </div>
                    )
                }
            <button 
                className="mt-4 btn btn-info" onClick={verifyData}>{t("verify")}</button>
        </div>
        {
            signatureMessages.map((e,index)=>{
                if(index<15){
                    return <p key={index} className={isMessageVerified?("text-info"):("text-error")}>{e}</p>
                }
            })
            }
        {       
        (signedValue === "") ? (
            null
        ) : (
            <label>
                {t("message")}:
                <OutputTextarea textValue={signedValue}/>
            </label>
        )
        
    }

        {
        validatingInProgress?(
            <button className="btn btn-square">
                <span className="loading loading-spinner"></span>
            </button>
        ):(null)
    }

    {
        (checkedFiles.length !== 0 && !validatingInProgress) ? (
            <ShowFilesInTable files={checkedFiles} removeExtensions={false}/>
        ) : (null)
    }
    </div>
    )
}