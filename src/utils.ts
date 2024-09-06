import {  DecryptMessageResult, Key, PrimaryUser, PrivateKey, PublicKey, SignaturePacket, VerificationResult, VerifyMessageResult, decrypt, decryptKey, readKey, readMessage, readPrivateKey } from "openpgp";
import { useEffect, useRef } from "react";
import { CryptoKeys, file, keyInfo, preferences } from "./types";
import { IPublicKey } from "./redux/publicKeySlice";
import { IPrivateKey } from "./redux/privateKeySlice";
import { User } from "openpgp";
import { TFunction } from "i18next";
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
export const attempToDecryptAll = async (dataToUnlock:CryptoKeys[],passphrase:string)=>{ // so that same passwords doesn't need to be entered multiple times
  
}
export const mergeKeysLists = async (publicKeys:IPublicKey[],privateKeys:IPrivateKey[]):Promise<Key[]>=>{
  const result:Key[]=[];
  for await(const publicKey of publicKeys){
    const key:Key|null = await readKey({armoredKey:publicKey.keyValue}).catch(e => { console.error(e); return null });
    if(!key){
      continue;
    }
    result.push(key);
  }
  for await(const privateKey of privateKeys){
    const key:Key|null = await readKey({armoredKey:privateKey.keyValue}).catch(e => { console.error(e); return null });
    if(!key){
      continue;
    }
    let index:number = result.findIndex(e=>e.getFingerprint()===key.getFingerprint())
    if(index === -1){
      result.push(key);
    }else{
      result[index] === key;
    }
  }
  return result;
}

export const expirationDateToString = (expirationDate:Date|null|number,t:TFunction<"translation", undefined>)=>{
  let expirationDateAsString;
  if(expirationDate instanceof Date){
    expirationDateAsString = expirationDate.toLocaleDateString();
  }else if(typeof expirationDate === "number"){
    expirationDateAsString = "∞";
  }else{
    expirationDateAsString = t("expired");
  }
  return expirationDateAsString;
}
export const expirationDateToStyle = (expirationDate:Date|null|number)=>{
  let expirationDateAsString;
  if(expirationDate instanceof Date){
    expirationDateAsString = "text-success";
  }else if(typeof expirationDate === "number"){
    expirationDateAsString = "text-success";
  }else{
    expirationDateAsString = "text-error";
  }
  return expirationDateAsString;
}

export const parseToKeyinfoObject = async (keys:Key[],t:TFunction<"translation", undefined>)=>{
  return Promise.all(keys.map(async (e)=>{
    const userID:PrimaryUser|null = await e.getPrimaryUser().catch(e=>{console.error(e);return null});
    const expirationDate = await e.getExpirationTime()
    let expirationDateAsString = expirationDateToString(expirationDate,t);
    const keyInfoObject:keyInfo = {
        isPrivate:e.isPrivate(),
        primaryName:userID?.user.userID?.name || userID?.user.userID?.userID || "",
        primaryEmail:userID?.user.userID?.email || "",
        fingerprint:e.getFingerprint().toUpperCase(),
        armoredKey:e.armor(),
        expirationDate:expirationDateAsString,
        creationDate:e.getCreationTime(),
        algorithm:e.getAlgorithmInfo(),
        allKeys:e.getKeys(),
        users:e.users,
        isExpired:!((expirationDate instanceof Date) || (typeof expirationDate === "number"))
    }
    return keyInfoObject
  }))
  
}
type publicKeyNames = 'rsaEncryptSign' | 'rsaEncrypt' | 'rsaSign' | 'elgamal' | 'dsa' | 'ecdh' | 'ecdsa' | 'eddsa' | 'aedh' | 'aedsa';

export const publicKeyEnumToReadable = (keyName:publicKeyNames)=>{
  switch(keyName){
    case 'rsaEncryptSign':{
      return "RSA (encrypt and sign)"
    }
    case 'rsaEncrypt':{
      return "RSA (encrypt only)"
    }
    case 'rsaSign':{
      return "RSA (sign only)"
    }
    case 'elgamal':{
      return "Elgamal"
    }
    case 'dsa':{
      return "DSA"
    }
    case 'ecdh':{
      return "ECDH"
    }
    case 'ecdsa':{
      return "ECDSA"
    }
    case 'eddsa':{
      return "EDDSA"
    }
    case 'aedh':{
      return "AEDH"
    }
    case 'aedsa':{
      return "AEDSA"
    }
    default:{
      return keyName;
    }

  }
}

export const uint8ArrayToHex = (bytes:Uint8Array)=> {
  const r = [];
  const e = bytes.length;
  let c = 0;
  let h;
  while (c < e) {
    h = bytes[c++].toString(16);
    while (h.length < 2) {
      h = '0' + h;
    }
    r.push('' + h);
  }
  return r.join('');
}


export const verifyCertification = async(user:User,publicKeys:PublicKey[],signature:SignaturePacket):Promise<true|null>=>{
  //@ts-ignore this function is not available in typescript :(
  const result = await user.verifyCertificate(signature,publicKeys).catch(e=>{return null})
  return result;
}

export const getPrivateKey = (privateKeysList:IPrivateKey[],preferences:preferences):string =>{
  return privateKeysList.find(e=>e.fingerprint===preferences.defaultSigningKeyFingerprint)?.keyValue || privateKeysList[0]?.keyValue || "";
}
