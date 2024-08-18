import { VerifyMessageResult } from "openpgp";
import { useEffect, useRef } from "react";
import { file } from "./types";

export const usePrevious = (value:string):string =>{
    const ref = useRef<string>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current || "encryption";
  }

export const getSignatureInfo = async (signaturesObject:VerifyMessageResult<string>):Promise<string[]|false>=>{
  let verified = false;
  let info = [];
  for (const signature of signaturesObject.signatures){
      let isVerified:boolean = await signature.verified.catch(e=>{return false});
      if(isVerified){
          info.push(`Valid signature with keyID: ${signature.keyID.toHex()}`)
          verified=true;
      }
  }
  if(!verified){
    return Promise.reject(false);
  }

  return Promise.resolve(info);

}

export const handleDataLoaded=(event:React.ChangeEvent<HTMLInputElement>):file[]|null=> {
  if(!event?.target.files){
      return null;
  }
  let files:file[] = [];
  for(let i =0; i<event.target.files.length;i++){
    let file = event.target.files[i];

    const reader = new FileReader();
    reader.onload = function(event) {
        if(!event.target){
            return
        }
        if(event.target.result instanceof ArrayBuffer){

          let uint = new Uint8Array(event.target.result);
          files.push({
            data:uint,
            fileName:file.name
          })
        }

    };
    reader.readAsArrayBuffer(file);
  }
  return files;
}


export const convertUint8ToUrl =(data:Uint8Array):string=>{
  let blob = new Blob([data],{type:"application/octet-stream"});
  let url = window.URL.createObjectURL(blob) 
  return url;
}