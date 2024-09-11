import { test, expect } from './fixtures';

test.describe("Encryption page",()=>{
  test('encryption section', async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html?popup=false`);
    await expect(page).toHaveTitle("GPG4Browsers");
  });
})

