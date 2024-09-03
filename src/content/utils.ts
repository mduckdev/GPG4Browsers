export function processPage(globalMessages:string[],pgpMessagePattern:RegExp): HTMLElement[]|undefined {
    const page = document.querySelector('html');
    if(!page){
        return;
    }
    
    let pgpMatchesInnerText = page.innerText.match(pgpMessagePattern);
    if(!pgpMatchesInnerText){
        return;
    }
    let pgpMatchesInnerHtml = page.innerHTML.match(pgpMessagePattern);
    if(!pgpMatchesInnerHtml){
        return;
    }
    if(pgpMatchesInnerHtml.length !== pgpMatchesInnerHtml.length){
        return;
    }
    if(pgpMatchesInnerText.length === globalMessages.length){
        return
    }
    for(let i = 0; i<pgpMatchesInnerText.length; i++){
        const span = `<span class="GPG4Browsers">${pgpMatchesInnerHtml[i]}</span>`;
        console.log(globalMessages.includes(pgpMatchesInnerText[i]))
        if(!globalMessages.includes(pgpMatchesInnerText[i])){
            globalMessages.push(pgpMatchesInnerText[i]);
            page.innerHTML=page.innerHTML.replace(pgpMatchesInnerHtml[i],span)    
        }
    }
    const messagesHTML = Array.from(document.querySelectorAll("span.GPG4Browsers"));
    const results:HTMLElement[] = []
    for(const message of messagesHTML){
        if(!message.querySelector("div.GPG4Browsers")){
            const container = document.createElement("div");
            container.classList.add("GPG4Browsers");
            // icon.src = "icons/icon48.png";            
            // icon.addEventListener("mouseover", function() {
                //   this.title = "Decrypt message"; 
                // });
                
                // icon.addEventListener("mouseout", function() {
                    //   this.title = ""; 
                    // });
                    
            message.appendChild(container);
            results.push(container as HTMLElement)
            
          }
        
    }
    return results;
}