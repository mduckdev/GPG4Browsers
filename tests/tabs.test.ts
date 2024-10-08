import { test, expect } from './fixtures';


test.describe("Tests switching encryption tabs",()=>{
    test.beforeEach(async({page,webExtURL})=>{
        await page.goto(`${webExtURL}/popup.html?popup=false`);
    })
    test('Correct rendering encryption tab', async ({ page, webExtURL }) => {
        await expect(page.locator("#encryption")).toHaveCount(1);
        await expect(page.locator("#decryption")).toHaveCount(0); 
        await expect(page.locator("#message")).toHaveCount(1); 
        await expect(page.locator("#message")).toHaveCount(1);
        await expect(page.getByTestId("PublicKeyDropdown")).toHaveCount(1); 
        await expect(page.getByTestId("PrivateKeyDropdown")).toHaveCount(1); 
        await expect(page.locator("input.checkbox")).toHaveCount(2); 
        await expect(page.locator("#encryptBtn")).toHaveCount(1); 
    });
    test('Correct rendering decryption tab', async ({ page, webExtURL }) => {
        await page.getByText("Decryption").click();
        await expect(page.locator("#encryption")).toHaveCount(0);
        await expect(page.locator("#decryption")).toHaveCount(1); 
        await expect(page.getByRole("button",{name:"Decrypt"})).toHaveCount(1); 
    });
});

test.describe("Tests switching signature tabs",()=>{
    test.beforeEach(async({page,webExtURL})=>{
        await page.goto(`${webExtURL}/popup.html?popup=false`);
        await page.getByText("Signatures").click();
    })
    test('Correct rendering signing tab', async ({ page, webExtURL }) => {
        await expect(page.locator("#signing")).toHaveCount(1);
        await expect(page.getByTestId("PrivateKeyDropdown")).toHaveCount(1); 
        await expect(page.locator("input.checkbox")).toHaveCount(1); 
        await expect(page.locator("#validatingSignatures")).toHaveCount(0);
    });
    test('Correct rendering validating signatures tab', async ({ page, webExtURL }) => {
        await page.getByText("Validating signatures").click();
        await expect(page.locator("#signing")).toHaveCount(0);
        await expect(page.locator("#validatingSignatures")).toHaveCount(1);
        await expect(page.getByRole("button",{name:"Verify"})).toHaveCount(1); 
    });
});

