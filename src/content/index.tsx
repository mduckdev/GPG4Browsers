import { createRoot } from "react-dom/client";
import Content from "./content";
import React from "react";
import "./css/style.css"
import { processPage } from "./utils";

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


renderApp();
// setInterval(renderApp,1000)