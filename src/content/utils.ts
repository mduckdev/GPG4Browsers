import { ProcessPageResults, pgpType } from "@src/types";
import { pgpMessagePattern } from ".";
const textEncoding = require('text-encoding-utf-8'); //https://github.com/openpgpjs/openpgpjs/issues/1036 without these 3 lines openpgpjs is throwing Error: concatUint8Array: Data must be in the form of a Uint8Array
global.TextEncoder = textEncoding.TextEncoder;
global.TextDecoder = textEncoding.TextDecoder;
import { Message, Signature, readMessage, readSignature } from "openpgp";

export function processPage(globalMessages:string[],pgpMessagePattern:RegExp): ProcessPageResults|undefined {
    const results:ProcessPageResults = {
        newHtmlElements:[],
        newPgpMessages:[]
    }
    const page = document.querySelector('html');
    if(!page){
        return;
    }
    
    let pgpMatchesInnerText = page.innerText.match(pgpMessagePattern);
    if(!pgpMatchesInnerText){
        return;
    } 
    let pgpMatchesInnerHtml = page.innerHTML.match(pgpMessagePattern);
    if(!pgpMatchesInnerHtml){
        return;
    }
    if(pgpMatchesInnerHtml.length !== pgpMatchesInnerHtml.length){
        return;
    }
    if(pgpMatchesInnerText.length === globalMessages.length){
        return
    }
    for(let i = 0; i<pgpMatchesInnerText.length; i++){
        const span = `<span class="GPG4Browsers">${pgpMatchesInnerHtml[i]}</span>`;
        if(!globalMessages.includes(pgpMatchesInnerText[i])){
            results.newPgpMessages.push(pgpMatchesInnerText[i]);
            page.innerHTML=page.innerHTML.replace(pgpMatchesInnerHtml[i],span)    
        }
    }
    results.newPgpMessages = results.newPgpMessages.map(match => match.replaceAll('\t',''));
    const messagesHTML = Array.from(document.querySelectorAll("span.GPG4Browsers"));
    for(const message of messagesHTML){
        if(!message.querySelector("div.GPG4Browsers")){
            const container = document.createElement("div");
            container.classList.add("GPG4Browsers");
            message.appendChild(container);
            results.newHtmlElements.push(container as HTMLElement)
          }
        
    }
    return results;
}

export const parsePgpData = async (value:string) =>{
    const message:Message<string>|null = await readMessage({armoredMessage:value}).catch(e=>{console.log("Not a message");return null})
    if(message){
        if(!message.getText()){
            return {object:message,text:"decrypt"};

        }else{
            return {object:message,text:"verify"};
        }
    }
    const signature:Signature|null = await readSignature({armoredSignature:value}).catch(e=>{console.log("Not an inline signature");return null})
    if(signature){
        return {object:signature,text:"verify"};
    }
}

