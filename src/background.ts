import browser from "webextension-polyfill"
import { storeBootstrap } from "./redux/store";
import { setLastSection, setLastTab } from "./redux/historySlice";
let globalBlob:Blob|undefined;
let globalData:string|undefined;
browser.contextMenus.create({
    id: "encrypt-selected",
    title: "Encrypt",
    contexts: ["selection"],
});
const openWindowAndWaitForData = ()=>{
    browser.windows.create({ url: "popup.html?popup=false&waitForData=true"})
}
setInterval(()=>{
    globalData=undefined;
},5000)

browser.contextMenus.onClicked.addListener(async(info, tab) => {
    switch (info.menuItemId) {
        case "encrypt-selected":
            globalData=info.selectionText;
            const store = await storeBootstrap();
            store.dispatch(setLastTab("encryption"))
            openWindowAndWaitForData();
            break;
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
        case "get-data":{
            let temp = globalData;
            globalData=undefined;
            return temp;
        }
        case "set-encrypted-data":{
            globalData=request.data;
            const store = await storeBootstrap();
            store.dispatch(setLastTab("decryption"))
            openWindowAndWaitForData();
            return Promise.resolve(true);
        }
        case "set-signed-data":{
            globalData=request.data;
            const store = await storeBootstrap();
            store.dispatch(setLastTab("validatingSignatures"))
            openWindowAndWaitForData();
            return Promise.resolve(true);
        }
        case "set-key-data":{
            globalData=request.data;
            const store = await storeBootstrap();
            store.dispatch(setLastSection("AddKey"))
            openWindowAndWaitForData();
            return Promise.resolve(true);
        }
        default: {
            return Promise.reject(false);
        }

    }
});

