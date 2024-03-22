const subjectBox = document.querySelector("input[name='subjectbox']");
const encryptButton = document.createElement('button');
encryptButton.textContent = 'Zaszyfruj';

encryptButton.addEventListener('click', async () => {
    const message = subjectBox.value;
    await browser.runtime.sendMessage({ action: 'open-encryption-tab' })
    //const response = await browser.runtime.sendMessage({ action: 'encrypt', message: message, publicKey: publicKey })
    //subjectBox.value = response;
});

// Dodaj przycisk obok inputa
subjectBox.parentNode.insertBefore(encryptButton, subjectBox.nextSibling);