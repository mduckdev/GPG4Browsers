import { ContentProps } from "@src/types";
import React, { useEffect, useState } from "react";
import { parsePgpData } from "./utils";
 
const buttonStyle = {
  backgroundColor: '#3B82F6',
  color: 'white',
  fontWeight: 'bold',
  padding: '8px 16px',
  borderRadius: '4px',
  border: 'none',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
};

export default function Content({pgpValue}:ContentProps) {
  const [buttonText,setButtonText] = useState<string>("");
  const checkPgpData = async ()=>{
    const parsed = await parsePgpData(pgpValue);

    if(parsed){
      console.log(parsed)
      setButtonText(parsed.text);
    }
  }
  useEffect(()=>{
    checkPgpData();
  },[pgpValue])
  return(
    <div>
    {
      buttonText?(
      <button 
      style={buttonStyle}
      
      onFocus={(e) => {
        e.target.style.outline = 'none';
        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
      }}
      onBlur={(e) => {
        e.target.style.boxShadow = buttonStyle.boxShadow;
      }}
    >
      {buttonText}
    </button>
      ):(null)
    }
     
    </div>
  )
}