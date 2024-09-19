import { test, expect } from './fixtures';
import { TEST_EXAMPLE_COM_UNLOCKED, TEST_LOCKED_123 } from './keys';
import { addKeyFromTextarea, filterSelectedKeys, generateRandomNumber, generateRandomString } from './test-util';



test.describe("Encryption page logic",()=>{
    test.beforeEach(async ({ page, webExtURL }) => {
        await page.goto(`${webExtURL}/popup.html?popup=false`);
        await addKeyFromTextarea(page,TEST_LOCKED_123);
        await addKeyFromTextarea(page,TEST_EXAMPLE_COM_UNLOCKED);
    });

    test("Encrypt and sign with unlocked key",async ({ page, webExtURL }) => {
        const selectedKeys:string[]=["test@example.com"]
        const message:string = generateRandomString(generateRandomNumber(2,1000))
        await page.locator("textarea#message").fill(message);

        await page.getByTestId("PublicKeyDropdown").click();
        await filterSelectedKeys(page,selectedKeys)
        await page.getByTestId("PublicKeyDropdown").click();

        await page.getByTestId("PrivateKeyDropdown").click();
        await filterSelectedKeys(page,selectedKeys)
        await page.getByTestId("PrivateKeyDropdown").click();

        await page.locator("button#encryptBtn").click();
        await expect(page.locator("textarea#outputTextarea")).toBeVisible();
        const encryptedMessage = await page.locator("textarea#outputTextarea").inputValue();
        expect(page.locator("textarea#outputTextarea")).toContainText("-----BEGIN PGP MESSAGE-----");
        expect(page.locator("textarea#outputTextarea")).toContainText("-----END PGP MESSAGE-----");
        await page.getByText("Decryption").click();
        await page.locator("textarea#encryptedMessage").fill(encryptedMessage);
        await expect(page.locator("textarea#outputTextarea")).toBeVisible();
        await expect(page.locator("textarea#outputTextarea")).toContainText(message);
        await expect(page.locator("p.text-info")).toContainText("Valid signature from test <test@example.com>, Primary key fingerprint: b30ec8bdd3110f1e381d3b639150d0123f5ca2f3, Key ID: 9150d0123f5ca2f3")
    })
  
})