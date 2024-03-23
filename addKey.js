const addPublicKey = async (name, content,publicKeysList) => {
    publicKeysList[name] = content;
    await savePublicKeysList(publicKeysList);
};
const removePublicKey = async (name,publicKeysList) => {
    delete publicKeysList[name];
    await savePublicKeysList(publicKeysList);
};
const savePublicKeysList = async (publicKeysList) => {
    await browser.storage.local.set({ publicKeysList }).catch((error) => {
        console.error('Error while saving: ', error);
    });
};
const isKeyNameUnique = (name,publicKeysList) => {
    if(name in publicKeysList){
        return false;
    }
    return true;
};
document.getElementById('saveButton').addEventListener('click', async () => {
    const publicKeyName = document.getElementById("keyName").value; 
    const publicKey = document.getElementById("publicKey").value;
    let publicKeysList = await browser.storage.local.get({ publicKeysList: {} });
    publicKeysList = publicKeysList.publicKeysList;
    let isValidKey = await browser.runtime.sendMessage({action:"validate-key",publicKey:publicKey}).catch(e=>{console.error(e);})
    if(!isKeyNameUnique(publicKeyName,publicKeysList)){
        alert("Name must be unique")
        return;
    }
    if(!isValidKey){
        alert("Invalid key")
        return;
    }
    await addPublicKey(publicKeyName,publicKey,publicKeysList);
    alert("Successfully added new public key")
    const window = await browser.windows.getCurrent()
    browser.windows.remove(window.id)
})