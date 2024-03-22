browser.contextMenus.create({
    id: "encrypt-selected",
    title: "Zaszyfruj",
    contexts: ["selection"],
});
browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "encrypt-selected":
            browser.windows.create({ url: `p.html?selectedText=${encodeURIComponent(info.selectionText)}`, width: 700, height: 400 })
            break;
    }
});
// Funkcja do szyfrowania wiadomości e-mail
async function encryptMessage(message, publicKey) {
    // Utwórz obiekt klucza publicznego z ciągu znaków klucza
    const pgpKey = await openpgp.readKey({ armoredKey: publicKey });
    const pgpMessage = await openpgp.createMessage({ text: message });


    // Szyfruj wiadomość przy użyciu klucza publicznego
    const response = await openpgp.encrypt({
        message: pgpMessage,
        encryptionKeys: pgpKey,
    }).then((encrypted) => {
        // Zwróć zaszyfrowaną wiadomość w postaci tekstowej
        return encrypted;
    }).catch(e => console.error(e))
    return response;
}

// Nasłuchuj na zdarzenie przychodzącej wiadomości
browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.action) {
        case "encrypt": {
            // Szyfruj wiadomość i zwróć zaszyfrowaną wiadomość
            const encryptedMessage = await encryptMessage(request.message, request.publicKey);
            console.log(encryptedMessage)
            return Promise.resolve(encryptedMessage);
        }
        case "open-encryption-tab": {
            browser.windows.create({ url: "p.html" })
            return Promise.resolve(true)
        }

        default: {
            return Promise.reject(false);
        }

    }
});
