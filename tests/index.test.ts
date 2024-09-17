import { test, expect } from './fixtures';

test.describe("Encryption page rendering",()=>{
    test('Correct rendering in popup view', async ({ page, webExtURL }) => {
      await page.goto(`${webExtURL}/popup.html`);
      await expect(page).toHaveTitle("GPG4Browsers"); //title
      await expect(page.locator("input.input-file")).toHaveCount(0); // in popup=false it should be rendered
      await expect(page.locator("#openFullscreenIcon")).toHaveCount(1) // in popup=false it should be rendered
    });
    test('Correct rendering in non-popup view', async ({ page, webExtURL }) => {
      await page.goto(`${webExtURL}/popup.html?popup=false`);
      await expect(page).toHaveTitle("GPG4Browsers"); //title
      await expect(page.locator("#openFullscreenIcon")).toHaveCount(0); // in popup=false it shouldn't be rendered
      await expect(page.locator("input.input-file")).toHaveCount(0);
      await expect(page.locator("#theme-toggle")).toHaveCount(1);
      await expect(page.locator("#encryption")).toHaveCount(1); 
      await expect(page.locator("div.tabs.tabs-lifted.mt-4")).toHaveCount(1); 
      await expect(page.locator("nav.btm-nav")).toHaveCount(1); 
    });
    
  })