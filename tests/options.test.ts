import { test, expect } from './fixtures';



test.describe("Options page logic",()=>{
    // test.beforeEach(async ({ page, webExtURL }) => {
        
    // });

    test("Testing detection option",async ({ page, webExtURL }) => {
        await page.goto("https://gist.github.com/mduckdev/ad232504a7d09dc7e1bcf02fe24bf6c7");
        await page.waitForSelector("div.GPG4Browsers");
        await expect(await page.locator('div.GPG4Browsers').count()).toBeGreaterThan(0)
        await page.goto(`${webExtURL}/popup.html?popup=false`);
        await page.getByText("Options").click();
        await page.getByRole('button', { name: 'Options' }).click();
        await expect(page.locator(':text("Detect PGP messages and keys on websites") + input')).toBeChecked();
        await page.getByText("Detect PGP messages and keys on websites").click();
        await page.getByText("Save changes").click();
        await expect(page.locator("div.alert-success span")).toContainText("Successfully saved changes");
        await page.getByRole('button', { name: 'Encryption' }).click();
        await page.getByRole('button', { name: 'Options' }).click();
        await expect(page.locator(':text("Detect PGP messages and keys on websites") + input')).not.toBeChecked();
        await page.goto("https://gist.github.com/mduckdev/ad232504a7d09dc7e1bcf02fe24bf6c7");
        await expect(await page.locator('div.GPG4Browsers').count()).toEqual(0)
    })
  
})