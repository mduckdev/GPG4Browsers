import * as React from "react";
import { createRoot } from 'react-dom/client';
import browser from "webextension-polyfill";
import { Provider } from 'react-redux';
import "./css/app.css";
import App from "./App";
import { storeBootstrap } from "./redux/store";

const renderApp = async () => {
  const rootNode = document.getElementById("popup-root-id");

  if (!rootNode) {
    console.error("Could not find root element to mount to!");
    return;
  }

  const store = await storeBootstrap();
  const root = createRoot(rootNode);

  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
};

browser.tabs.query({ active: true, currentWindow: true }).then(renderApp);
