import * as React from "react";
import { createRoot } from 'react-dom/client';
import browser from "webextension-polyfill";
import { Provider } from 'react-redux';
import "./css/app.css";
import App from "./App";
import { storeBootstrap } from "./redux/store";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import { languages } from "./locales/";
import detector from "i18next-browser-languagedetector";
i18n
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: languages,
    // lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",
   
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });
  // i18n.changeLanguage("pl")
  export default i18n;
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
