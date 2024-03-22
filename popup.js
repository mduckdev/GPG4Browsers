// popup.js
document.addEventListener('DOMContentLoaded', function () {
    // Odczytaj parametr GET zawierający zaznaczony tekst
    const params = new URLSearchParams(window.location.search);
    const selectedText = params.get('selectedText');

    // Wyświetl zaznaczony tekst na stronie
    document.getElementById('message').value = selectedText;
});

document.getElementById('encryptBtn').addEventListener('click', async () => {
    const message = document.getElementById('message').value;
    const publicKey = document.getElementById('publicKey').value;
    // Wysyłanie zapytania do background.js w celu szyfrowania wiadomości
    const response = await browser.runtime.sendMessage({ action: 'encrypt', message: message, publicKey: publicKey })

    const encryptedMessageDiv = document.getElementById('encryptedMessage');
    encryptedMessageDiv.innerText = 'Encrypted message: \n' + response;

});
