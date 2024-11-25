import { Page, BrowserContext, Locator, expect } from '@playwright/test';
import { WebActions } from "@lib/WebActions";
import qaTestData from '../../Environment_variables/staging/onBoardingTestData.json';

let webActions: WebActions;
let testData = qaTestData;

export class NewWorkspacePage {
    readonly page: Page;
    readonly context: BrowserContext;
    readonly TITLE: Locator;
    readonly EMAIL_BOX: Locator;
    readonly EMAIL_ID: Locator;
    readonly PASSWORD_BOX: Locator;
    readonly SIGNIN_BUTTON: Locator;
    readonly clickOnClearfeedStaging: Locator;
    readonly verifyCFMessage: Locator;
    readonly clickOnBottomUnreadBtn: Locator;
    readonly clickOnHome: Locator;
    readonly clickOnFileTicket: Locator;
    readonly clickOnCloseIcon: Locator;
    readonly clickOnMessage: Locator;
    readonly clickOnSlackLaunch: Locator;
    readonly slackRecognizeTitle: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
        webActions = new WebActions(this.page, this.context);
        this.TITLE = page.locator('//*[@title="Slack"]');
        this.EMAIL_BOX = page.locator('//*[contains(text(),"Enter email and password")]');
        this.EMAIL_ID = page.locator('//input[@placeholder="you@example.com"]');
        this.PASSWORD_BOX = page.locator('//input[@placeholder="password"]');
        this.SIGNIN_BUTTON = page.locator('//*[contains(text(),"Sign In")]');
        this.clickOnClearfeedStaging = page.locator('(//span[contains(text(),"ClearFeed Staging")])[1]');
        this.verifyCFMessage = page.locator('//div[@class="p-rich_text_block"]').last();
        this.clickOnBottomUnreadBtn = page.locator(`(//button[contains(text(),'Unread mentions')])[1]`);
        this.clickOnHome = page.locator('//button[@id="app"]');
        this.clickOnMessage = page.locator('//button[@id="messages"]');
        this.clickOnFileTicket = page.locator('//*[contains(text(),"File a ticket")]');
        this.clickOnCloseIcon = page.locator('//button[@aria-label="Close"]');
        this.clickOnSlackLaunch = page.locator('//button[@aria-label="Launch in Slack"]');
        this.slackRecognizeTitle = page.locator(`//h1[contains(text(),'We don’t recognize this browser')]`);

    }

    /**
     * Method to enter OTP
     */
    async enterOTP() {
        if (await this.slackRecognizeTitle.isVisible({ timeout: 5000 })) {
            let OTP = await webActions.extractOTP();
            console.log("OTP is:", OTP)

            await this.page.waitForSelector('input[aria-label="digit 1 of 6"]');

            // Fill OTP fields with the extracted digits
            for (let i = 0; i < OTP.length; i++) {
                await this.page.locator(`input[aria-label="digit ${i + 1} of 6"]`).fill(OTP[i]);
            }
            console.log("OTP successfully entered.");
            await this.page.waitForTimeout(30000);
        }
        else {
            console.log("OTP not found");
        }
    }

    /**
     * Method to Navigate Slack Workspace
     */
    async navigateToSlackAndClickGoogle() {
        await this.page.goto(testData.SlackURL);
        await this.page.waitForTimeout(3000);
        await webActions.createMailslurpInbox();
        await expect(this.page).toHaveTitle('Sign in to CF-Sandbox | Slack');
        await this.page.waitForTimeout(3000);
        await this.page.locator('//*[contains(text(),"Enter email and password")]').isVisible();
        await this.page.waitForTimeout(3000);
        await this.EMAIL_BOX.click();
        await this.EMAIL_ID.click();
        await this.EMAIL_ID.fill(testData.UserEmail);
        await this.PASSWORD_BOX.click();
        await this.PASSWORD_BOX.fill(await webActions.decipherPassword(testData.sandBoxPassword));
        await this.SIGNIN_BUTTON.click();
        await this.page.waitForTimeout(10000);
        await this.enterOTP();

        if (await this.clickOnSlackLaunch.isVisible({ timeout: 15000 })) {
            await this.clickOnSlackLaunch.click();
            await this.page.waitForTimeout(3000);
            await this.againNavigateToSlack();
        }
        else {
            console.log("Launch in Slack Button is not displayed")
        }
    }

    /**
     * Method to verify Slack Page Title
     */
    async verifySlackPageTitle() {
        await expect(this.page).toHaveTitle('Login | Slack');
    }

    /**
     * Method to verify Clearfeed Staging Message
     */
    async verifyClearfeedStagingMessage() {
        await this.clickOnBottomUnreadBtn.click();
        await this.clickOnClearfeedStaging.click();
        await this.clickOnMessage.click();
        await this.verifyCFMessage.scrollIntoViewIfNeeded();
        await expect(await this.verifyCFMessage).toBeVisible();
        await this.clickOnBottomUnreadBtn.click();
    }

    /**
     * Method to navigate from Slack to Clearfeed
     */
    async againNavigateToCF() {
        const pages = await this.context.pages();
        await pages[1].bringToFront();
    }


    /**
     * Method to navigate from Slack to Clearfeed
     */
    async againNavigateToSlack() {
        const pages = await this.context.pages();
        await pages[0].bringToFront();
        await this.page.waitForTimeout(1000);
        await this.page.close();
    }

}