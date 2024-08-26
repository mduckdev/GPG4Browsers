import { DecryptMessageResult, PrivateKey, VerificationResult, VerifyMessageResult, decrypt, decryptKey, readMessage, readPrivateKey } from "openpgp";
import { useEffect, useRef } from "react";
import { CryptoKeys, file } from "./types";
const extensionsRegex:RegExp = /(\.gpg|\.pgp|\.asc|\.sig)$/i;
export const usePrevious = (value:string):string =>{
    const ref = useRef<string>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current || "encryption";
  }
export const removeFileExtension = (input:string):string=>{
  return input.replace(extensionsRegex, '')
}
export const testFileExtension = (input:string):boolean=>{
  return extensionsRegex.test(input);
}
export const getSignatureInfo = async (signatures:VerificationResult[]):Promise<string[]>=>{
  let verified = false;
  let info = [];
  for (const signature of signatures){
      let isVerified:boolean = await signature.verified.catch(e=>{return false});
      if(isVerified){
          info.push(`Valid signature with keyID: ${signature.keyID.toHex()}`)
          verified=true;
      }
  }
  if(!verified){
    return Promise.reject(["Failed to verify message"]);
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
export const handleDataLoadedOnDrop = (files: File[]): file[] | null => {
  let filesLoaded: file[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function (event) {
      if (!event.target || !(event.target.result instanceof ArrayBuffer)) return;
      const uint = new Uint8Array(event.target.result);
      filesLoaded.push({
        data: uint,
        fileName: file.name
      });
    };
    reader.readAsArrayBuffer(file);
  }
  return filesLoaded;
};


export const convertUint8ToUrl = (data:Uint8Array):string =>{
  let blob = new Blob([data],{type:"application/octet-stream"});
  let url = window.URL.createObjectURL(blob) 
  return url;
}

export const formatBytes = (size: number): string =>{
  const units = ["B", "kB", "mB", "gB", "tB"];
  let index = 0;

  while (size >= 1000 && index < units.length - 1) {
      size /= 1000;
      index++;
  }

  return `${Math.floor(size)} ${units[index]}`;
}

export const getPrivateKeysAndPasswords=async(decryptionKeys:CryptoKeys[])=>{
  const unlockedDecryptionKeys = decryptionKeys.map((e)=>{
    if(e.isPrivateKey && e.isUnlocked && typeof e.data === "string"){
        return e.data;
    }else{
        return null;
    }
});
  const unlockedDecryptionKeysFiltered:string[] = unlockedDecryptionKeys.filter((e):e is string=>{
      return typeof e === "string";
  });
  const unlockedDecryptionKeysParsed:PrivateKey[] = await Promise.all(unlockedDecryptionKeysFiltered.map(async e=>await readPrivateKey({armoredKey:e})));

  const passwords = decryptionKeys.map((e)=>{
      if(!e.isPrivateKey && e.isUnlocked && typeof e.data === "string"){
          return e.data;
      }else{
          return null;
      }
  });
  const passwordsFiltered:string[] = passwords.filter((e):e is string=>{
      return typeof e === "string";
  });

  return {privateKeys:unlockedDecryptionKeysParsed,passwords:passwordsFiltered};
}

export const updateIsKeyUnlocked = async(selectedPrivKey:string,setIsSelectedPrivateKeyUnlocked:React.Dispatch<React.SetStateAction<boolean>>)=>{
  const parsed = await readPrivateKey({armoredKey:selectedPrivKey}).catch(e=>{console.error(e);return null});
  if(parsed){
      setIsSelectedPrivateKeyUnlocked(parsed.isDecrypted())
  }
}

export const attempToDecrypt = async (dataToUnlock:CryptoKeys,passphrase:string)=>{
  if(dataToUnlock.isPrivateKey && typeof dataToUnlock.data==="string"){ //current key is a locked private key
    const parsedCurrentKey = await readPrivateKey({armoredKey:dataToUnlock.data}).catch(e => { console.error(e); return null });
    if(!parsedCurrentKey){
      return;
    }

    const decrytpedKey:PrivateKey|null = await decryptKey({
      privateKey:parsedCurrentKey,
      passphrase:passphrase
    }).catch(e=>{
      console.error(e);
      return null;
    });

    if(!decrytpedKey){
      return Promise.reject("Error! Failed to unlock the private key.");
    }else{
      return Promise.resolve(decrytpedKey)
    }
  }

  if(!dataToUnlock.isPrivateKey){ //message/file encrypted with password
    let decryptedMessage:DecryptMessageResult|null
    if(dataToUnlock.data instanceof Uint8Array){
      const encryptedMessage = await readMessage({binaryMessage:dataToUnlock.data}).catch(e => { console.error(e); return null });
      if(!encryptedMessage){
        return
      }
       decryptedMessage = await decrypt({message:encryptedMessage,passwords:passphrase,format:"binary"}).catch(e => { console.error(e); return null });
    }else{
      const encryptedMessage = await readMessage({armoredMessage:dataToUnlock.data}).catch(e => { console.error(e); return null });
      if(!encryptedMessage){
        return
      }
       decryptedMessage = await decrypt({message:encryptedMessage,passwords:passphrase}).catch(e => { console.error(e); return null });
    }
    if(!decryptedMessage){
      return Promise.reject(`Error! Incorrect passphrase for `+(dataToUnlock.filename?(`file: ${dataToUnlock.filename}`):"encrypted message"));
    }else{
      return Promise.resolve(passphrase);
    }
    
  }
}



export const attempToDecryptAll = async (dataToUnlock:CryptoKeys[],passphrase:string)=>{
  
}