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