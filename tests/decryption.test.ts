import { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { addKeyFromTextarea } from './test-util';
import { TEST_EXAMPLE_COM_UNLOCKED } from './keys';




test.describe("Decrypting messages detected from content script, key missing",()=>{
    test.beforeEach(async ({ page, webExtURL }) => {
        await page.goto("https://gist.github.com/mduckdev/ad232504a7d09dc7e1bcf02fe24bf6c7");
    });

    test("Decrypt message encrypted and signed with unlocked key, key unavailable",async ({ page, webExtURL }) => {
        const newPagePromise:Promise<Page> = new Promise(resolve => page.context().once("page", resolve));
        await (await page.locator("div.GPG4Browsers img").all())[0].click();
        const newPage = await newPagePromise
        
        await expect(newPage.locator("div.alert-error span")).toContainText("Failed to find decryption key with keyID: 22f8c48852d3882a")

    });
})
test.describe("Decrypting messages detected from content script, key available",()=>{
    test.beforeEach(async ({ page, webExtURL }) => {
        await page.goto(`${webExtURL}/popup.html?popup=false`);
        await addKeyFromTextarea(page,TEST_EXAMPLE_COM_UNLOCKED)
        await page.goto("https://gist.github.com/mduckdev/ad232504a7d09dc7e1bcf02fe24bf6c7");
    });

    test("Decrypt message encrypted and signed with unlocked key, key available",async ({ page, webExtURL }) => {
        const newPagePromise:Promise<Page> = new Promise(resolve => page.context().once("page", resolve));
        await (await page.locator("div.GPG4Browsers img").all())[0].click();
        const newPage = await newPagePromise
        
        await expect(newPage.locator("p.text-info")).toContainText("Valid signature from: test <test@example.com>, Primary key fingerprint: b30ec8bdd3110f1e381d3b639150d0123f5ca2f3, Key ID: 9150d0123f5ca2f3")
        await expect(newPage.locator("textarea#outputTextarea")).toContainText("message signed");
    });
    test("Decrypt message encrypted with unlocked key, key available",async ({ page, webExtURL }) => {
        const newPagePromise:Promise<Page> = new Promise(resolve => page.context().once("page", resolve));
        await (await page.locator("div.GPG4Browsers img").all())[1].click();
        const newPage = await newPagePromise
        
        await expect(newPage.locator("p.text-error")).toContainText("Message authenticity could not be verified")
        await expect(newPage.locator("textarea#outputTextarea")).toContainText("message not signed");
    });
})

