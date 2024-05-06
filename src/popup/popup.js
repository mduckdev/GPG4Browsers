// popup.js
document.addEventListener('DOMContentLoaded', async () => {
    // Odczytaj parametr GET zawierający zaznaczony tekst
    const params = new URLSearchParams(window.location.search);
    const selectedText = params.get('selectedText');
    document.getElementById('message').value = selectedText;
    let publicKeysList = await browser.storage.local.get({ publicKeysList: {} });
    publicKeysList = publicKeysList.publicKeysList;
    for (const [key, value] of Object.entries(publicKeysList)) {
        const select = document.getElementById("keys");
        let keyOption = document.createElement("option");
        keyOption.value = key;
        keyOption.innerText = key;
        select.appendChild(keyOption);
    }
});

document.getElementById('encryptBtn').addEventListener('click', async () => {
    const message = document.getElementById('message').value;
    const keyName = document.getElementById('keys').value;

    // Wysyłanie zapytania do background.js w celu szyfrowania wiadomości
    let publicKeysList = await browser.storage.local.get({ publicKeysList: {} });
    publicKeysList = publicKeysList.publicKeysList;

    const response = await browser.runtime.sendMessage({ action: 'encrypt', message: message, publicKey: publicKeysList[keyName] })

    const encryptedMessageDiv = document.getElementById('encryptedMessage');
    encryptedMessageDiv.innerText = 'Encrypted message: \n' + response;

});
document.getElementById('newKey').addEventListener('click', async () => {
    browser.windows.create({ url: "../addKey.html", width: 700, height: 700 })
    return;
});

document.getElementById('enterKeyToggle').addEventListener('click', async () => {
    const keysLabel = document.getElementById("keysLabel");
    const keysDropdown = document.getElementById("keysDropdown");
    const newKey = document.getElementById("newKey");

    const publicKeyLabel = document.getElementById("publicKeyLabel");
    const publicKey = document.getElementById("publicKey");


    const enterKeyToggle = document.getElementById("enterKeyToggle");

    if (enterKeyToggle.checked) {
        keysLabel.style.display = "none";
        keysDropdown.style.display = "none";
        newKey.style.display = "none";

        publicKeyLabel.style.display = "block";
        publicKey.style.display = "block";
    } else {
        keysLabel.style.display = "block";
        keysDropdown.style.display = "block";
        newKey.style.display = "block";

        publicKeyLabel.style.display = "none";
        publicKey.style.display = "none";
    }

    return;
});