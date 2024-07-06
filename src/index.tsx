import * as React from "react";
import { createRoot } from 'react-dom/client';
import browser from "webextension-polyfill";
import "./css/app.css";
import App from "./App";


browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    const rootNode = document.getElementById("popup-root-id");
    const root = createRoot(rootNode);
    root.render(<App />)
});
