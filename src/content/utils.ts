import { ProcessPageResults, pgpType } from "@src/types";
const textEncoding = require('text-encoding-utf-8'); //https://github.com/openpgpjs/openpgpjs/issues/1036 without these 3 lines openpgpjs is throwing Error: concatUint8Array: Data must be in the form of a Uint8Array
global.TextEncoder = textEncoding.TextEncoder;
global.TextDecoder = textEncoding.TextDecoder;
import { Key, Message, Signature, readKeys, readMessage, readSignature } from "openpgp";

export const pgpMessagePattern = /-----BEGIN PGP MESSAGE-----[\s\S]+?-----END PGP MESSAGE-----/g;
export const pgpPublicKeyPattern = /-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]+?-----END PGP PUBLIC KEY BLOCK-----/g;

export function processPage(globalMessages: string[]): ProcessPageResults|undefined {
    const results: ProcessPageResults = {
        newHtmlElements: [],
        newPgpMessages: []
    };

    const page = document.querySelector('html');
    if (!page) return;

    const pgpMessagesHTML = page.innerHTML.match(pgpMessagePattern) || [];
    const pgpMessagesText = page.innerText.match(pgpMessagePattern) || [];

    const pgpPublicKeysHTML = page.innerHTML.match(pgpPublicKeyPattern) || [];
    const pgpPublicKeysText = page.innerText.match(pgpPublicKeyPattern) || [];


    const allMatchesHTML = [...pgpMessagesHTML, ...pgpPublicKeysHTML];
    const allMatchesText = [...pgpMessagesText, ...pgpPublicKeysText];


    if (allMatchesText.length === globalMessages.length) return;
    if(allMatchesText.length !== allMatchesHTML.length) return;

    for (let i =0; i<allMatchesText.length; i++) {
        if (!globalMessages.includes(allMatchesText[i])) {
            results.newPgpMessages.push(allMatchesText[i]);

            const span = `<span class="GPG4Browsers">${allMatchesHTML[i]}</span>`;

            page.innerHTML = page.innerHTML.replace(allMatchesHTML[i], span);
        }
    }
    results.newPgpMessages = results.newPgpMessages.map(match => match.replaceAll('\t',''));
    const messagesHTML = Array.from(document.querySelectorAll("span.GPG4Browsers"));
    for (const message of messagesHTML) {
        if (!message.querySelector("div.GPG4Browsers")) {
            const container = document.createElement("div");
            container.classList.add("GPG4Browsers");
            message.appendChild(container);
            results.newHtmlElements.push(container as HTMLElement); 
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
    const keys:Key[]|null = await readKeys({armoredKeys:value}).catch(e=>{console.log("Not a key");return null});
    if(keys){
        return {object:keys,text:"addKey"};
    }
}

