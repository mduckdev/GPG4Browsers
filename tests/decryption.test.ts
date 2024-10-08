import { test, expect } from './fixtures';




test.describe("Encryption page logic",()=>{
    test.beforeEach(async ({ page, webExtURL }) => {
        await page.goto("https://gist.github.com/mduckdev/ad232504a7d09dc7e1bcf02fe24bf6c7");
       
    });

    test("Encrypt and sign with unlocked key",async ({ page, webExtURL }) => {
       
    })
  
})