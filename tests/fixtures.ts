import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
const pathToExtension = path.join(__dirname, '../', 'dist');
export const test = base.extend<{ context: BrowserContext; webExtURL: string }>({
    context: async ({ }, use, testInfo) => {
        let browser = await chromium.launchPersistentContext('', {
            headless: false,
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
            ],
        });
        await use(browser);
        await browser.close();
    },
    webExtURL: async ({ context, browser }, use) => {
        let [background] = context.serviceWorkers();
        if (!background)
            background = await context.waitForEvent('serviceworker');
        let extensionId = background.url().split('/')[2];
        await use(`chrome-extension://${extensionId}`);
    },
});

export const expect = test.expect;
