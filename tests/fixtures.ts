import { test as base, chromium, type BrowserContext, type Worker } from '@playwright/test';
import path from 'path';

export const test = base.extend<{ context: BrowserContext; extensionId: string; worker: Worker }>({
    context: async ({ }, use) => {
        //NOTE: __dirname is the path of the 'tests' folder
        const pathToExtension = path.join(__dirname, '../', 'dist');
        const context = await chromium.launchPersistentContext('', {
            headless: false,
            args: [
                //`--headless=new`,
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
            ],
        });
        await use(context);
        await context.close();
    },
    extensionId: async ({ context }, use) => {
        console.log(context.serviceWorkers())
        let [background] = context.serviceWorkers();
        if (!background)
            background = await context.waitForEvent('serviceworker');

        const extensionId = background.url().split('/')[2];
        await use(extensionId);
    },
    worker: async ({ context }, use) => {
        let [background] = context.serviceWorkers();
        if (!background)
            background = await context.waitForEvent('serviceworker');

        await use(background);
    },
});
export const expect = test.expect;