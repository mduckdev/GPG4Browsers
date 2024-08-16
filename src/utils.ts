import { VerifyMessageResult } from "openpgp";
import { useEffect, useRef } from "react";

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

export const handleDataLoaded=(event:React.ChangeEvent<HTMLInputElement>,setFileName:React.Dispatch<React.SetStateAction<string|null>>,setFileData:React.Dispatch<React.SetStateAction<Uint8Array|null>>,setOppositeFileData:React.Dispatch<React.SetStateAction<string|null>>)=> {
  if(!event?.target.files){
      return;
  }
  
  const file = event.target.files[0];
  if(file.name){
      setFileName(file.name);
  }
  const reader = new FileReader();
  reader.onload = function(event) {
      if(!event.target){
          return
      }
      if(event.target.result instanceof ArrayBuffer){
          let uint = new Uint8Array(event.target.result);
          setFileData(uint);
          setOppositeFileData(null);
      }

  };
  reader.readAsArrayBuffer(file);
}


