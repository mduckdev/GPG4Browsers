import browser from "webextension-polyfill"
browser.contextMenus.create({
    id: "encrypt-selected",
    title: "Encrypt",
    contexts: ["selection"],
});
browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "encrypt-selected":
            browser.windows.create({ url: `popup.html?selectedText=${encodeURIComponent(info.selectionText || "")}`, width: 700, height: 400 })
            break;
    }
});


browser.runtime.onMessage.addListener(async (request, sender) => {
    switch (request.action) {
        case "open-encryption-tab": {
            browser.windows.create({ url: "popup.html" })
            return Promise.resolve(true)
        }
        default: {
            return Promise.reject(false);
        }

    }
});

