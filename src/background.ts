import browser, { action } from "webextension-polyfill"
import { storeBootstrap } from "./redux/store";
import { setLastSection, setLastTab } from "./redux/historySlice";
import { generateRandomString } from "../tests/test-util";
interface globalData{
    data:string,
    id:string,
    deleteAfter:number
}
let globalBlob:Blob|undefined;
let globalData:globalData[]=[];
browser.contextMenus.create({
    id: "encrypt-selected",
    title: "Encrypt",
    contexts: ["selection"],
});
const openWindowAndWaitForData = (id:string)=>{
    browser.windows.create({ url: `popup.html?popup=false&waitForData=true&id=${id}`})
}
setInterval(()=>{
    globalData = globalData.filter(e=>e.deleteAfter>Date.now());
},500)

browser.contextMenus.onClicked.addListener(async(info, tab) => {
    switch (info.menuItemId) {
        case "encrypt-selected":{
            if(!info.selectionText){
                break;
            }
            let id = generateRandomString(16);
            globalData.push({data:info.selectionText,id:id,deleteAfter:Date.now()+(1000*10)});
            const store = await storeBootstrap();
            store.dispatch(setLastTab("encryption"))
            openWindowAndWaitForData(id);
            break;
        }
            
    }
});

browser.runtime.onMessage.addListener(async (request, sender) => {
    switch (request.action) {
        case "open-encryption-tab": {
            browser.windows.create({ url: "popup.html" })
            return Promise.resolve(true)
        }
        case "get-icon-blob": {
            if(globalBlob){
                return globalBlob;
            }
            globalBlob = await fetch(browser.runtime.getURL("icons/icon48.png")).then(e=>{
                return e.blob();
            }).then(e=>{
                globalBlob=e;
                return  e;
            }).catch(e=>{
                console.error(e);
                return undefined;
            });
            return globalBlob;
        }
        case "get-data-by-id":{
            return globalData.find(e=>e.id===request.id)?.data;
        }
        case "set-encrypted-data":{
            let id = generateRandomString(16);
            globalData.push({data:request.data,id:id,deleteAfter:Date.now()+(1000*10)});

            const store = await storeBootstrap();
            store.dispatch(setLastTab("decryption"))
            openWindowAndWaitForData(id);
            return Promise.resolve(true);
        }
        case "set-signed-data":{
            let id = generateRandomString(16);
            globalData.push({data:request.data,id:id,deleteAfter:Date.now()+(1000*10)});
            const store = await storeBootstrap();
            store.dispatch(setLastTab("validatingSignatures"))
            openWindowAndWaitForData(id);
            return Promise.resolve(true);
        }
        case "set-key-data":{
            let id = generateRandomString(16);
            globalData.push({data:request.data,id:id,deleteAfter:Date.now()+(1000*10)});
            const store = await storeBootstrap();
            store.dispatch(setLastSection("AddKey"))
            openWindowAndWaitForData(id);
            return Promise.resolve(true);
        }
        default: {
            return Promise.reject(false);
        }

    }
});

