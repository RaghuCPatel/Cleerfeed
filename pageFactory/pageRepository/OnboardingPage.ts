import { Page, BrowserContext, expect, Locator } from '@playwright/test';
import { WebActions } from "@lib/WebActions";
import qaTestData from '../../Environment_variables/staging/onBoardingTestData.json';
import { testConfig } from '../../testConfig';
import axios from 'axios';

const envurl = testConfig.stageApi;
let webActions: WebActions;
let testData = qaTestData;
let requestchannelname;

export class OnboardingPage {
    readonly page: Page;
    readonly context: BrowserContext;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
        webActions = new WebActions(this.page, this.context);
    }
    async navigateToClearFeedAndClickGoogle() {
        const page2 = await this.context.newPage();
        await page2.goto('/');
        await page2.waitForTimeout(3000);
        await expect(page2).toHaveTitle('Login | ClearFeed');
        return page2;
    }
    async loginWithGoogle(page2: Page, email: string, password: string) {
        await page2.locator('//input[@id="email"]').fill(testData.UserEmail);
        await page2.locator(`//span[contains(text(),'Send login link to email')]`).click();
        const page5 = await this.context.newPage();
        await page5.goto(await webActions.extractLink());
        await webActions.deleteInbox()
        await page2.waitForTimeout(3000);
        await page5.close();
    }
    async loginToClearFeedWithGoogle(cfpage: Page, email: string, password: string) {
        await this.loginWithGoogle(cfpage, email, password);
        await cfpage.bringToFront();
        await cfpage.waitForLoadState('load');
        await expect(cfpage).toHaveTitle('Account Setup', { timeout: 10000 });
    }

    async verifyHaveYouHerePage(page2: Page, phone: number, code: string): Promise<void> {
        await page2.locator('//h2[contains(text(),"Great to have you here")]').isVisible();
        await page2.locator('//*[contains(text(),"How did you hear about ClearFeed?")]').isVisible();
        await page2.locator('//*[contains(text(),"Opt in for White Glove Support")]').isVisible();
        await this.selectRandomRadioButtonByCSS(page2);
        await page2.locator('//*[contains(text(),"Describe your use case")]').isVisible();
        await this.selectRandomRadioButonForCase(page2);
        await page2.evaluate(() => window.scrollBy(0, 1000));
        await page2.locator('//*[contains(text(),"Phone")]').isVisible();
        await page2.waitForLoadState('networkidle');
        await page2.locator('//div[@class="ant-select-selector"]').click();
        await page2.waitForLoadState('networkidle');
        await page2.locator('//input[@id="primary_contact_info_country_code"]').fill(code);
        await page2.locator(`text=[IN] India +91`).click();
        await page2.locator('//input[@placeholder="Your number"]').fill("");
        await page2.locator('//button[@type="submit"]').click();
        await page2.waitForLoadState('networkidle');
        await page2.locator('//div[contains(text(),"Please enter a valid phone number")]').isVisible();
        await page2.locator('//input[@placeholder="Your number"]').fill(phone.toString());
        await page2.locator('//input[@id="send_slack_connect_invite"]').isVisible();
        await page2.locator('//button[@type="submit"]').click();
    }

    async selectRandomRadioButtonByCSS(page2: Page): Promise<void> {
        console.log("length", testData.radioButtonValues.length, "&", testData.radioButtonValues[0]);
        const randomValue: string = testData.radioButtonValues[0]
        const selector: string = `//div[@id="cf_discovery_source_source"]//span/preceding-sibling::input[@type='radio'][@value="${randomValue}"]`;
        await page2.waitForLoadState('networkidle');
        await page2.waitForSelector(selector, { timeout: 90000 });
        const radioButton = await page2.locator(selector);
        await radioButton.isVisible();
        await radioButton.click();
        await page2.waitForTimeout(3000);
        if (randomValue == "Other") {
            const string = await webActions.generateRandomString(10);
            await page2.locator('//input[@id="cf_discovery_source_other_source"]').fill(string);
        }
    }

    async selectRandomRadioButonForCase(page2: Page): Promise<void> {
        console.log("length", testData.radioButtonValuesForCase.length, "&", testData.radioButtonValuesForCase[0]);
        const randomValue: string = testData.radioButtonValuesForCase[0]
        const selector: string = `//div[@id="account_use_case_use_case"]//span/preceding-sibling::input[@type="radio"][@value="${randomValue}"]`;
        await page2.waitForLoadState('networkidle');
        await page2.waitForSelector(selector, { timeout: 7000 });
        const radioButton = page2.locator(selector);
        await radioButton.isVisible();
        await radioButton.click();
        await page2.waitForTimeout(3000);
        if (randomValue == "Other") {
            const string = await webActions.generateRandomString(10);
            await page2.locator('//input[@placeholder="Tell us your use case"]').fill(string)
        }
    }

    async verifyAuthorizeSlack(page2: Page): Promise<void> {
        await page2.locator('//h2[contains(text(),"Install ClearFeed App")]').isVisible();
        await page2.locator('//label[@class="ant-radio-button-wrapper ant-radio-button-wrapper-checked px-6 py-7"]').click();
        await page2.locator('//button[@type="button"]//span[contains(text(),"Authorize Slack")]').click();
    }

    async verifySignInClearFeed(page2: Page): Promise<void> {
        await page2.locator('//h2[@class="p-oauth_page__heading"]').isVisible();
        await page2.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page2.waitForTimeout(5000);
        await page2.locator('//button[@aria-label="Allow"]').isVisible();
        await page2.locator('//button[@aria-label="Allow"]').click();
    }

    async verifyAccountSetUp(page2: Page, accountSetup: string): Promise<void> {
        await page2.locator('//h2[@class="ant-typography mt-1 mb-1"]').isVisible();
        await page2.locator('//*[contains(text(),"How do you plan to use ClearFeed?")]').isVisible();
        await page2.locator(`//*[contains(text(),"${accountSetup}")]`).click();
        await page2.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page2.locator('//*[@class="ant-radio-input"][@value="STANDALONE"]').click();
        await page2.locator('//span[contains(text(),"Continue")]').click();
    }

    async verifyAccountSetUpByUsingExternalTools(page2: Page, accountSetup: string): Promise<void> {
        await page2.locator('//h2[@class="ant-typography mt-1 mb-1"]').isVisible();
        await page2.locator('//*[contains(text(),"How do you plan to use ClearFeed?")]').isVisible();
        await page2.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page2.locator('(//*[@class="ant-radio-input"][@value="EXTERNAL"])[2]').click();
        await page2.waitForTimeout(2000);
        await page2.locator('(//span[contains(text(),"Zendesk")])[2]').click();
        await page2.locator('(//div[contains(text(),"Zendesk")])[1]').click();
        await page2.locator('//span[contains(text(),"Connect")]').isVisible();
    }

    async verifyCollection(page2: Page): Promise<void> {
        await page2.locator('//*[@class="ant-typography mt-1 mb-1"]').isVisible();
        await page2.locator('//input[@id="requestChannelName"]').fill('igs' + Math.floor(Math.random() * 899 + 100));
        requestchannelname = await page2.locator('//input[@id="requestChannelName"]').getAttribute('value');
        await page2.locator('//span[contains(text(),"Continue")]').click();
        await page2.locator('//input[@id="triageChannelName"]').fill("igsindia" + Math.floor(Math.random() * 8 + 100));
        await page2.locator('//span[contains(text(),"Continue")]').click();
        await page2.locator(`//span[contains(text(),'Skip')]`).click();
    }

    async verifyYouAreAllSetPage(page2: Page): Promise<void> {
        await page2.locator('//*[contains(text(),"You’re all set!")]').isVisible();
        await page2.locator('//a[contains(text(),"Quick cheat sheet")]').isVisible();
        await page2.locator('//*[contains(text(),"Quick video")]').isVisible();
        page2.locator('//*[@class="ant-btn-icon"]');
        await page2.locator('//span[contains(text(),"Reach out to us via Slack Connect")]').isVisible();
        await page2.locator('//span[contains(text(),"Send Invite")]').isEnabled();
        await page2.locator('//span[contains(text(),"Reach out to us via Chat")]').isVisible();
        await page2.locator('//span[contains(text(),"Chat Now")]').isEnabled();
        await page2.locator('//span[contains(text(),"Set up an onboarding call with us")]').isVisible();
        await page2.locator('//span[contains(text(),"Schedule")]').isEnabled();
        await page2.locator('//button[@aria-label="Open Beacon popover"]').isVisible();
        const dashboard = page2.locator('//*[contains(text(),"Go to dashboard")]');
        await dashboard.click();
        await page2.waitForTimeout(5000);
        let actRequestedChannelname = await page2.locator('//span[@class="break-word"]').textContent();
        await expect(actRequestedChannelname).toContain(requestchannelname);
        await page2.waitForLoadState('load');
        await page2.locator('//a//span[text()="Inbox"]').isVisible();
        await page2.waitForLoadState('load');
    }

    async verifyGloveSupportOpt(page2: Page): Promise<void> {
        await page2.locator('//input[@id="send_slack_connect_invite"]').isVisible();
        await page2.locator('//button[@type="submit"]').click();
    }

    async clickOnGloveSupportOpt(page2: Page): Promise<void> {
        await page2.locator('//input[@id="send_slack_connect_invite"]').isVisible();
        await page2.locator('//input[@id="send_slack_connect_invite"]').click();
        await page2.locator('//button[@type="submit"]').click();
    }

    async deleteAccountAPI(accountId: string, page: Page, context: BrowserContext) {
        console.log(envurl);
        const webActions = new WebActions(page, context);
        const token = await webActions.decipherToken();
        const response = await axios.delete(envurl + `/super-admin/api/account/${accountId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        expect(response.status).toBe(200);
    }

}