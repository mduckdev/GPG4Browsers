import { ProcessPageResults, pgpType } from "@src/types";
const textEncoding = require('text-encoding-utf-8'); //https://github.com/openpgpjs/openpgpjs/issues/1036 without these 3 lines openpgpjs is throwing Error: concatUint8Array: Data must be in the form of a Uint8Array
global.TextEncoder = textEncoding.TextEncoder;
global.TextDecoder = textEncoding.TextDecoder;
import { Key, Message, Signature, readKeys, readMessage, readSignature } from "openpgp";

export const pgpMessagePattern = /-----BEGIN PGP MESSAGE-----[\s\S]+?-----END PGP MESSAGE-----/g;
export const pgpPublicKeyPattern = /-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]+?-----END PGP PUBLIC KEY BLOCK-----/g;

export function processPage(
    globalMessages: string[],
    regexes: RegExp[] = [pgpMessagePattern, pgpPublicKeyPattern]
): ProcessPageResults | undefined {

    const newPgpMessages: string[] = [];
    const newHtmlElements: HTMLElement[] = [];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let currentNode: Node | null;
    let currentMessage = '';

    while ((currentNode = walker.nextNode())) {
        const textContent = currentNode.textContent; 
        if (textContent) {
            currentMessage += textContent;

            for (const regex of regexes) {
                let match: RegExpExecArray | null;

                while ((match = regex.exec(currentMessage))) {
                    const matchedMessage = match[0].split("\n").map(e=>e.trim()).filter((e,index)=>e.length>0 || index ===1).join("\n"); // Zostawiamy pełną wiadomość z nowymi liniami

                    if (globalMessages.includes(matchedMessage) || newPgpMessages.includes(matchedMessage)) {
                        continue;
                    }
                    newPgpMessages.push(matchedMessage);

                    const parentElement = currentNode.parentElement;
                    if (parentElement) {
                        const newDiv = document.createElement("div");
                        newDiv.className="GPG4Browsers"
                        parentElement.insertBefore(newDiv, currentNode.nextSibling);
                        newHtmlElements.push(newDiv);
                    }

                    break;
                }
            }
        }

        if (currentMessage.includes("-----END PGP MESSAGE-----")) {
            currentMessage = ''; 
        }
    }

    if (newPgpMessages.length === 0) {
        return undefined;
    }

    return {
        newHtmlElements,
        newPgpMessages,
    };
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

