import { Expect, Locator, Page } from "@playwright/test";
export const addKeyFromTextarea = async (page:Page,key:string)=>{
    await page.locator("button#AddPrivateKey").click();
    await page.locator("textarea#keyValue").fill(key);
    await page.getByRole("button",{name:"Save"}).click({force:true});
}

export const generateRandomString = (length:number):string=> {
    if (length <= 1) {
      return "1";
    }
  
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return randomString;
  }

export const generateRandomNumber=(min:number, max:number)=> {
    if (min >= max) {
        throw new Error("Min must be lower than max");
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const filterSelectedKeys = async(page:Page,selectedKeys:string[]) =>{
  for await(const dropdownItem of await page.getByTestId("DropdownItem").all()){
    for await(const selectedKey of selectedKeys){
        if((await dropdownItem.innerText()).includes(selectedKey)){
            if(await dropdownItem.locator("input").isChecked()){
                continue;
            }else{
                await dropdownItem.click()
            }
        }else{
            if(await dropdownItem.locator("input").isChecked()){
                await dropdownItem.click()
            }else{
                continue;
            }
        }
    }
  }
}