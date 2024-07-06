import * as openpgp from "openpgp"
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


async function encryptMessage(message: string, publicKey: string) {
    const pgpKey = await openpgp.readKey({ armoredKey: publicKey });
    const pgpMessage = await openpgp.createMessage({ text: message });

    const response = await openpgp.encrypt({
        message: pgpMessage,
        encryptionKeys: pgpKey,
    }).then((encrypted) => {
        return encrypted;
    }).catch(e => console.error(e))
    return response;
}


browser.runtime.onMessage.addListener(async (request, sender) => {
    switch (request.action) {
        case "encrypt": {
            const encryptedMessage = encryptMessage(request.message, request.publicKey);
            console.log(encryptedMessage)
            return Promise.resolve(encryptedMessage);
        }
        case "open-encryption-tab": {
            browser.windows.create({ url: "popup.html" })
            return Promise.resolve(true)
        }
        case "validate-key": {
            let key = await openpgp.readKey({ armoredKey: String(request.publicKey) }).catch(e => { console.error(e); return null });
            if (!key) {
                return Promise.reject(false);
            }
            return Promise.resolve(true)
        }
        default: {
            return Promise.reject(false);
        }

    }
});