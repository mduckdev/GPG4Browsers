import { createRoot } from "react-dom/client";
import Content from "./content";
import React from "react";
import { processPage } from "./utils";
import { storeBootstrap, useAppSelector } from "@src/redux/store";
import { getDetectMessages } from "@src/redux/preferencesSlice";

let globalMessages:string[]=[];
const renderApp = async () => {
    const pageResults = processPage(globalMessages);
    if (!pageResults) {
      console.error("No PGP messages found");
      return;
    }
    if(pageResults.newHtmlElements.length !== pageResults.newPgpMessages.length){
        console.error("PGP message and element count mismatch");
        return;
    }
    globalMessages = globalMessages.concat(pageResults.newPgpMessages);
    pageResults.newHtmlElements.forEach((e:HTMLElement,index:number)=>{
        const root = createRoot(e);
        root.render(
            <Content pgpValue={pageResults.newPgpMessages[index].replace("\t","")} />
        );
    })
    
};

(async  () => {
    const store = await storeBootstrap();
    if(getDetectMessages(store.getState())){
        renderApp();
        let lastHTML = document.documentElement.innerHTML;
        setInterval(()=>{
            if(lastHTML !== document.documentElement.innerHTML){
                lastHTML = document.documentElement.innerHTML;
                renderApp();
            }
        },1000)
    }
})();