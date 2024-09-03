import { createRoot } from "react-dom/client";
import Content from "./content";
import React, { useState } from "react";
import "@src/css/app.css"
import { processPage } from "./utils";
const pgpMessagePattern = /-----BEGIN PGP MESSAGE-----[\s\S]+?-----END PGP MESSAGE-----/g;
const globalMessages:string[]=[];

const renderApp = async () => {
    const rootNode = processPage(globalMessages,pgpMessagePattern);
  
    if (!rootNode) {
      console.error("No PGP messages found");
      return;
    }
  
    rootNode.forEach(e=>{
        const root = createRoot(e);
        root.render(
            <Content />
        );
    })
    
};

renderApp();
