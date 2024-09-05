import { ContentProps } from "@src/types";
import React, { useEffect, useState } from "react";
import {  parsePgpData } from "./utils";
import Browser from "webextension-polyfill";
 
export default function Content({pgpValue}:ContentProps) {
  const [buttonText,setButtonText] = useState<string>("");
  const [imgBlob,setImgBlob] = useState<Blob>();


  const checkPgpData = async ()=>{
    const parsed = await parsePgpData(pgpValue);

    if(parsed){
      setButtonText(parsed.text);
    }
  }
  const getImageBlob = async ()=>{
    const response = await Browser.runtime.sendMessage({action:"get-icon-blob"});
    if(response instanceof Blob){
      setImgBlob(response)
    }
  }
  const handleClick = async () =>{
    switch(buttonText){
      case "decrypt":{
        Browser.runtime.sendMessage({action:"set-encrypted-data",data:pgpValue});
        return;
      }
      case "verify":{
        Browser.runtime.sendMessage({action:"set-signed-data",data:pgpValue});
        return;
      }
      case "addKey":{
        Browser.runtime.sendMessage({action:"set-key-data",data:pgpValue});
        return;
      }
    }
  }
 

  useEffect(()=>{
    checkPgpData();
    getImageBlob()
  },[])
  return(
    <div>
    {
      <img 
        src={imgBlob?URL.createObjectURL(imgBlob):("")} 
        title={buttonText}  style={{cursor:'pointer'}} 
        onClick={handleClick}
      >
      </img>
    }
     
    </div>
  )
}