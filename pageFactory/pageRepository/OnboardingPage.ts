import { Page, BrowserContext, expect, Locator } from '@playwright/test';
import { WebActions } from "@lib/WebActions";
import qaTestData from '../../Environment_variables/staging/onBoardingTestData.json';
import { testConfig } from '../../testConfig';
import axios from 'axios';

const envurl = testConfig.stageApi;

let webActions: WebActions;
let testData = qaTestData;
let requestchannelname: string;
let triagechannelname: string;

export class OnboardingPage {
    readonly page: Page;
    readonly context: BrowserContext;
    readonly searchChannelId: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
        webActions = new WebActions(this.page, this.context);
    }

    /**
     * Method to Navigate application page 
     * @returns 
     */
    async navigateToClearFeedAndClickGoogle() {
        const page2 = await this.context.newPage();
        await page2.goto('/');
        await page2.waitForTimeout(3000);
        await expect(page2).toHaveTitle('Login | ClearFeed');
        return page2;
    }

    /**
     * Method to enter Google Credential
     * @param page2 
     * @param email 
     * @param password 
     */
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

    /**
     * Method to verify Great to have you here page
     * @param page2 
     * @param phone 
     * @param code 
     */
    async verifyHaveYouHerePage(page2: Page, phone: number, code: string): Promise<void> {
        await page2.locator('(//*[contains(text(),"Step")])[1]').isVisible();
        await page2.locator('//h2[contains(text(),"Great to have you here")]').isVisible();
        await page2.locator('//*[contains(text(),"Let’s get your account set up in a few steps")]').isVisible();
        await page2.locator('//*[contains(text(),"How did you hear about ClearFeed?")]').isVisible();
        await page2.locator('//button[@type="submit"]').click();
        await page2.locator('//*[contains(text(),"Please specify how you heard about ClearFeed")]').isVisible();
        await page2.locator('//*[contains(text(),"Please specify your use case")]').isVisible();
        await page2.locator('//*[contains(text(),"Please enter a valid phone number")]').isVisible();
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
    }

    /**
     * Method to Verify Great Company link
     * @param page2 
     */
    async verifyGreatCompany(page2: Page) {
        await page2.locator('//h1[contains(text(),"You are in great company")]').isVisible();
        let greatCompany = await page2.$$('//div[@class="ant-image"]//img');
        for (let i = 0; i < greatCompany.length; i++) {
            await greatCompany[i].isVisible();
        }
    }

    /**
     * Method to verify Glove Support opt  
     * @param page2 
     */
    async verifyGloveSupportOpt(page2: Page): Promise<void> {
        await page2.locator('//input[@id="send_slack_connect_invite"]').isVisible();
        await page2.locator('//button[@type="submit"]').click();
    }

    /**
     * Method to verify Glove opt and uncheck the check box
     * @param page2 
     */
    async clickOnGloveSupportOpt(page2: Page): Promise<void> {
        await page2.locator('//input[@id="send_slack_connect_invite"]').isVisible();
        await page2.locator('//input[@id="send_slack_connect_invite"]').click();
        await page2.locator('//button[@type="submit"]').click();
    }

    /**
     * Method to verify hear about ClearFeed 
     * @param page2 
     */
    async selectRandomRadioButtonByCSS(page2: Page): Promise<void> {
        let hearAboutClearfeedOpt = await page2.$$(`//div[@id="cf_discovery_source_source"]//span/preceding-sibling::input[@type='radio']`);
        for (let i = 0; i < hearAboutClearfeedOpt.length; i++) {
            await hearAboutClearfeedOpt[i].click();
        }
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

    /**
     * Method to verify teams
     * @param page2 
     */
    async selectRandomRadioButonForCase(page2: Page): Promise<void> {
        await page2.locator('//*[contains(text(),"Which team are you a part of?")]').isVisible();
        let teamOpt = await page2.$$(`//div[@id="account_use_case_use_case"]//span/preceding-sibling::input[@type="radio"]`);
        for (let i = 0; i < teamOpt.length; i++) {
            await teamOpt[i].check();
        }
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

    /**
     * Method to verify Install ClearFeed App Page
     * @param page2 
     */
    async verifyAuthorizeSlack(page2: Page): Promise<void> {
        await page2.locator('(//*[contains(text(),"Step")])[1]').isVisible();
        await page2.locator('//h2[contains(text(),"Install ClearFeed App")]').isVisible();
        await page2.locator('//label[@class="ant-radio-button-wrapper px-6 py-7"]').isVisible();
        await page2.locator('//label[@class="ant-radio-button-wrapper ant-radio-button-wrapper-checked px-6 py-7"]').click();
        await page2.locator(`(//*[contains(text(),"Don't have permission to add apps to Slack ? ")])[1]`).isVisible();
        await page2.locator('//div[@class="ant-typography-copy"]').isVisible();
        await page2.locator('//div[@class="ant-typography-copy"]').click();
        await this.verifySecureFromDayOne(page2, 1);
        await page2.locator('//button[@type="button"]//span[contains(text(),"Authorize Slack")]').click();
    }

    /**
     * Verify Secure From Day One images and links
     * @param page2 
     * @param index 
     */
    async verifySecureFromDayOne(page2: Page, index: number) {
        await page2.locator(`(//*[contains(text(),"Step")])[${index}]`).isVisible();
        let secureData = await page2.$$('//div[@class="ant-image"]//img');
        for (let i = 0; i < secureData.length; i++) {
            await secureData[i].isVisible();
        }
        let privacyLink = await page2.$$('//div[@class="ant-col mb-1"]');
        for (let i = 0; i < privacyLink.length; i++) {
            await privacyLink[i].isVisible();
        }

    }

    /**
     * Method to verify requesting permission
     * @param page2 
     */
    async verifySignInClearFeed(page2: Page): Promise<void> {
        await page2.locator('//h2[@class="p-oauth_page__heading"]').isVisible();
        await page2.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page2.waitForTimeout(5000);
        let clearfeedStagingSections = await page2.$$('//section[@class="p-scope_info__section"]');
        for (let i = 0; i < clearfeedStagingSections.length; i++) {
            await clearfeedStagingSections[i].isVisible();
        }
        await page2.locator('//button[@aria-label="Allow"]').isVisible();
        await page2.locator('//button[@aria-label="Allow"]').click();
        await page2.waitForTimeout(10000);
    }

    /**
     * Navigate from Clearfeed to Slack workspace
     * @param page2 
     */
    async navigateBack(page2: Page) {
        await page2.waitForTimeout(5000);
        const pages = await this.context.pages();
        await pages[0].bringToFront();
    }

    /**
     * Method to navigate from Slack to Clearfeed
     * @param page2 
     */
    async againNavigateToCF(page2: Page): Promise<void> {
        const pages = await this.context.pages();
        await pages[1].bringToFront();
        await page2.waitForTimeout(1000);
    }

    /**
     * Method to verify onboarding page using standalone helpdesk
     * @param page2 
     * @param accountSetup 
     */
    async verifyAccountSetUp(page2: Page, accountSetup: string): Promise<void> {
        await page2.locator('//h2[@class="ant-typography mt-1 mb-1"]').isVisible();
        await page2.locator('//*[contains(text(),"How do you plan to use ClearFeed?")]').isVisible();
        await page2.locator(`//*[contains(text(),"${accountSetup}")]`).click();
        await page2.evaluate(() => {
            window.scrollBy(0, 1000);
        });
        await page2.locator('//*[@class="ant-radio-input"][@value="STANDALONE"]').click();
        await this.verifySecureFromDayOne(page2, 2);
        await page2.locator('//span[contains(text(),"Continue")]').click();
    }

    /**
     * Method to verify onboarding page using Extenal tools
     * @param page2 
     */
    async verifyAccountSetUpByUsingExternalTools(page2: Page): Promise<void> {
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

    /**
     * Method to create a requestChannel and triageChannel
     * @param page2 
     */
    async verifyCollection(page2: Page): Promise<void> {
        await page2.locator('//*[@class="ant-typography mt-1 mb-1"]').isVisible();
        let slackLinks = await page2.$$('//ul[@class="my-1 mb-6 px-6 text-neutral-700"]//li');
        for (let i = 0; i < slackLinks.length; i++) {
            await slackLinks[i].isVisible();
        }
        await this.verifyRequestChannelImg(page2, 2)
        await page2.locator('//input[@id="requestChannelName"]').fill('igs' + await webActions.getCryptoRandomNumber(1, 100));
        requestchannelname = await page2.locator('//input[@id="requestChannelName"]').getAttribute('value');
        await page2.locator('//span[contains(text(),"Continue")]').click();
        await page2.locator('//*[@class="ant-typography mt-1 mb-1"]').isVisible();
        await this.verifyRequestChannelImg(page2, 2)
        await page2.locator('//input[@id="triageChannelName"]').fill("igsindia" + await webActions.getCryptoRandomNumber(1, 100));
        triagechannelname = await page2.locator('//input[@id="triageChannelName"]').getAttribute('value');
        await page2.locator('//span[contains(text(),"Continue")]').click();
        await page2.locator('//*[@class="ant-typography mt-1 mb-1"]').isVisible();
        await this.verifyRequestChannelImg(page2, 2)
        await page2.locator('//*[contains(text(),"Email Addresses")]').isVisible();
        await page2.locator('//*[contains(text(),"+ Add Invite")]').click();
        await page2.locator('(//button[@type="button"])[1]').isVisible();
        await page2.locator('//input[@id="dynamic_form_nest_item_users_0_email"]').fill(testData.AddInvite);
        await page2.locator('//*[contains(text(),"Submit")]').click();
        await page2.locator('//div[@class="ant-alert-message"]').isVisible();
        await page2.locator(`//span[contains(text(),'Skip')]`).click();
    }

    /**
     * Verify Request channel image
     * @param page2 
     * @param index 
     */
    async verifyRequestChannelImg(page2: Page, index: number) {
        await page2.locator(`(//*[contains(text(),"Step")])[${index}]`).isVisible();
        await page2.locator('(//div[@class="ant-image"]//img)[3]').isVisible();
    }

    /**
     * Method to verify Explore your setup page
     * @param page2 
     */
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
        await page2.locator('//span[text()="Inbox"]').isVisible();
        await page2.waitForLoadState('load');
    }

    /**
     * Method to verify Dashboard and create a Request
     * @param page2 
     */
    async verifyDashboardAndCreateRequst(page2: Page) {
        await page2.waitForTimeout(1000);
        await page2.locator('//*[contains(text(),"New Request")]').click();
        await page2.locator('//h3[contains(text(),"Request")]').isVisible();
        await page2.locator('//*[contains(text(),"Create Request")]').click();
        await page2.locator('//*[contains(text(),"Request Description is required")]').isVisible();
        await page2.locator('//button[@class="ant-modal-close"]//span//span').isVisible();
        await page2.locator('//label[contains(text(),"Request Channel")]').isVisible();
        await page2.locator('//input[@id="topic_id"]').click();
        await page2.waitForTimeout(1000);
        await page2.locator('(//div[@class="ant-select-item-option-content"]//div)[2]').click();
        await this.clickOnCloseIcon(page2, 4)
        await page2.locator('//label[contains(text(),"Request Description")]').isVisible();
        await page2.locator('//div[@class="ql-container ql-snow"]//div[1]').fill(testData.requestDescription);
        await page2.waitForTimeout(1000);
        await page2.locator(' //label[contains(text(),"Status")]').isVisible();
        await page2.locator('//label[contains(text(),"Priority")]').isVisible();
        await page2.locator('//label[contains(text(),"Assignee")]').isVisible();
        await page2.locator('//input[@id="assignee_user_id"]').click();
        await page2.locator('(//*[contains(text(),"clearfeed01")])[1]').click();
        await page2.locator('//*[contains(text(),"Create Request")]').click();
        await page2.locator('//*[contains(text(),"Request has been created successfully.")]').isVisible();
        await page2.waitForTimeout(3000);
        let actRequestedChannelname = await page2.locator('//span[@class="break-word"]').textContent();
        await expect(actRequestedChannelname).toContain(requestchannelname);
    }

    /**
     * Method to close popup
     * @param page2 
     * @param index 
     */
    async clickOnCloseIcon(page2: Page, index: number) {
        await page2.waitForTimeout(10000);
        await page2.locator(`(//button[@class="ant-modal-close"]//span)[${index}]`).click();
    }

    /**
     * Method to verify Collection Setting
     * @param page2 
     */
    async verifyCollectionSetting(page2: Page) {
        await page2.locator('(//*[contains(text(),"Slack Channels")])[1]').click();
        await page2.locator('(//div[@class="ant-segmented-group"]//div)[3]').click();
        let headersText = await page2.$$('//span[@class="ant-collapse-header-text"]');
        for (let i = 0; i < headersText.length; i++) {
            await headersText[i].isVisible();
            await headersText[i].click();
            await page2.waitForTimeout(1000);
            await headersText[i].click();
        }
    }

    /**
     * Method to verify Request Channel
     * @param page2
     * @param index 
     */
    async verifyRequestChannel(page2: Page, index: number) {
        await page2.locator(`(//span[@class="ant-collapse-header-text"])[${index}]`).click();
        await page2.waitForTimeout(2000);
        let actRequestedChannelname = await page2.locator('(//table[@style="table-layout: auto;"]//tbody//tr//td)[1]//span//span').textContent();
        await expect(actRequestedChannelname).toContain(requestchannelname);
        await page2.locator('(//span[@class="ant-collapse-header-text"])[3]').click();
    }

    /**
     * Method to verify Workflow
     * @param page2 
     */
    async verifyWorkflow(page2: Page) {
        await page2.locator('//*[contains(text(),"COLLECTIONS")]').isVisible();
        await page2.locator('(//span[@class="ant-tree-switcher ant-tree-switcher_close"])[2]//span').click();
        await page2.locator('(//*[contains(text(),"Slack Channels")])[1]').isVisible();
        await page2.locator('(//span[@class="ant-tree-switcher ant-tree-switcher_close"])[2]//span').click();
        await page2.locator('(//*[contains(text(),"Slack Channels")])[1]').click();
        await page2.waitForTimeout(3000);
        await page2.locator('(//div[@class="ant-segmented-group"]//div)[2]').click();
        await page2.locator('(//*[contains(text(),"New Workflow")])[1]').click();
        let workflowOpt = await page2.$$('//div[@class="ant-steps-item-content"]//div');
        for (let i = 0; i < workflowOpt.length; i++) {
            await workflowOpt[i].isVisible();
        }
        await page2.locator('(//*[contains(text(),"Select a workflow condition")])[1]').isVisible();
        await page2.locator('(//*[contains(text(),"Priority")])[2]').isVisible();
        await page2.locator('(//div[@class="ant-select-selector"])[1]').click();
        await page2.locator('(//*[contains(text(),"Normal")])[1]').click();
        await page2.locator('(//*[contains(text(),"Contact Stage:")])[1]').isVisible();
        await page2.locator('(//div[@class="ant-select-selector"])[2]').click();
        await page2.locator('(//*[contains(text(),"First Contact")])[1]').click();
        await page2.locator('(//*[contains(text(),"Request Created During:")])[1]').isVisible();
        await page2.locator('(//div[@class="ant-select-selector"])[3]').click();
        await page2.locator('(//*[contains(text(),"Any Time")])[2]').click();
        await page2.locator(`//span[contains(text(),'Continue')]`).click();

        await page2.locator('//div[@class="ant-row ant-row-center ant-row-middle"]//h2').isVisible();
        let timeInMints = await page2.$$('//div[@class="ant-col ant-col-8 d-flex justify-center align-center"]//button');
        for (let i = 0; i < timeInMints.length; i++) {
            await timeInMints[i].isVisible();
        }
        await page2.locator('(//div[@class="ant-col ant-col-8 d-flex justify-center align-center"]//button)[2]').click();

        await page2.locator('(//*[contains(text(),"Select an action to be performed")])[1]').isVisible();
        await page2.locator('(//div[@class="ant-select-selector"])[2]').click();
        await page2.locator('((//div[@class="ant-select-item-option-content"])[1]//span)[2]').click();

        let reviewWorkflow = await page2.$$('//div[@class="ant-card-body"]');
        for (let i = 0; i < reviewWorkflow.length; i++) {
            await reviewWorkflow[i].isVisible();
        }
        await page2.locator('(//*[contains(text(),"Publish workflow")])[1]').click();
        await page2.locator('(//*[contains(text(),"Workflow has been saved successfully")])[1]').isVisible();
    }

    /** Method to verify Request Channel ID in Slack workspace */
    async validateRequestChannelID() {
        await this.page.waitForTimeout(2000);
        console.log(`//span[contains(text(),"${requestchannelname}")]`);
        await this.page.locator(`//span[contains(text(),"${requestchannelname}")]`).click()
        await this.page.waitForTimeout(2000);
    }

    /**
     * Method for delete account id
     * @param accountId 
     * @param page 
     * @param context 
     */
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