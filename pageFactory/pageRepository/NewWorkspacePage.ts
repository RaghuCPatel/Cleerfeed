import { Page, BrowserContext, Locator, expect } from '@playwright/test';
import { WebActions } from "@lib/WebActions";
import qaTestData from '../../Environment_variables/staging/testData.json';

let webActions: WebActions;
let testData = qaTestData;

export class NewWorkspacePage {
    readonly page: Page;
    readonly context: BrowserContext;
    readonly TITLE: Locator;
    readonly EMAIL_BOX: Locator;
    readonly EMAIL_ID: Locator;
    readonly PASSWORD_BOX: Locator;
    readonly SIGNIN_BUTTON:Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
        webActions = new WebActions(this.page, this.context);
        this.TITLE = page.locator('//*[@title="Slack"]');
        this.EMAIL_BOX = page.locator('//*[contains(text(),"Enter email and password")]');
        this.EMAIL_ID = page.locator('//input[@placeholder="you@example.com"]'); 
        this.PASSWORD_BOX = page.locator('//input[@placeholder="password"]');  
        this.SIGNIN_BUTTON = page.locator('//*[contains(text(),"Sign In")]'); 

    }

async navigateToSlackAndClickGoogle() {
    await this.page.goto(testData.SlackURL);
    await this.page.waitForTimeout(3000); 
    await expect(this.page).toHaveTitle('Sign in to CF-Sandbox | Slack');
    await this.page.waitForTimeout(3000);
    await this.page.locator('//*[contains(text(),"Enter email and password")]').isVisible();
    await this.page.waitForTimeout(3000);
    await this.EMAIL_BOX.click();
    await this.EMAIL_ID.click();
    await this.EMAIL_ID.fill(testData.UserEmail);
    await this.PASSWORD_BOX.click();
    await this.PASSWORD_BOX.fill(await webActions.decipherPassword(await webActions.decipherPassword(testData.sandBoxPassword)));
    await this.SIGNIN_BUTTON.click();
}

    async verifySlackPageTitle() {
        await expect(this.page).toHaveTitle('Login | Slack');
    }

}