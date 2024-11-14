import { Page, BrowserContext, expect } from '@playwright/test';
import { WebActions } from "@lib/WebActions";
import qaTestData from '../../Environment_variables/staging/testData.json';


let webActions: WebActions;
let testData = qaTestData;

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

async loginWithGoogle1(page2: Page, email: string, password: string) {
    const pagePromise1 = this.context.waitForEvent('page');
    await page2.locator('//*[contains(text(),"Continue with Google")]').click();
    const page3 = await pagePromise1;
    await page3.locator('//input[@id="identifierId"]').click();
    await page3.locator('//input[@id="identifierId"]').fill(testData.UserEmail);
    await page3.locator('//*[contains(text(),"Next")]').click();
    await page3.locator('//input[@name="Passwd"]').waitFor({ state: 'visible', timeout: 20000 });
    await page3.locator('//input[@name="Passwd"]').click();
    await page3.locator('//input[@name="Passwd"]').fill(await webActions.decipherPassword(testData.password));
    await page3.locator('//*[contains(text(),"Next")]').click();
    //Transition from google authentication to clearfeed page
    await page2.waitForTimeout(10000); 
}
async loginToClearFeedWithGoogle(cfpage: Page, email: string, password: string) {
    await this.loginWithGoogle1(cfpage, email, password);
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
    await page2.waitForTimeout(2000);
    await page2.locator('//input[@id="primary_contact_info_country_code"]').fill(code);
    await page2.locator(`text=[IN] India +91`).click();
    await page2.locator('//input[@placeholder="Your number"]').fill(phone.toString());
    page2.locator('//input[@id="send_slack_connect_invite"]');
    await page2.locator('//button[@type="submit"]').click();
}

async selectRandomRadioButtonByCSS(page2: Page): Promise<void> {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % testData.radioButtonValues.length;
    const randomValue: string = testData.radioButtonValues[randomIndex];
    const selector: string = `//div[@id="cf_discovery_source_source"]//span/preceding-sibling::input[@type='radio'][@value="${randomValue}"]`;
    await page2.waitForLoadState('networkidle');
    await page2.waitForSelector(selector, { timeout: 90000 });
    const radioButton = await page2.locator(selector);
    await radioButton.isVisible();
    await radioButton.click();
    await page2.waitForTimeout(3000);
    if(randomValue == "Other"){
        const string = await webActions.generateRandomString(10);
        await page2.locator('//input[@id="cf_discovery_source_other_source"]').fill(string);
    }
    console.log(`Successfully clicked the radio button with value "${randomValue}"`);
}

async selectRandomRadioButonForCase(page2: Page): Promise<void> {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % testData.radioButtonValues.length;
    const randomValue: string = testData.radioButtonValues[randomIndex];
    const selector: string = `//div[@id="account_use_case_use_case"]//span/preceding-sibling::input[@type="radio"][@value="${randomValue}"]`;
    await page2.waitForLoadState('networkidle');
    await page2.waitForSelector(selector, { timeout: 90000 });
    const radioButton = page2.locator(selector);
    await radioButton.isVisible();
    await radioButton.click();
    await page2.waitForTimeout(3000);
    if(randomValue == "Other"){
        const string = await webActions.generateRandomString(10);
        await page2.locator('//input[@placeholder="Tell us your use case"]').fill(string)
    }
    console.log(`Successfully clicked the radio button with value "${randomValue}"`);
}


async VerifyAuthorizeSlack(page2: Page): Promise<void> {
    await page2.locator('//h2[contains(text(),"Install ClearFeed App")]').isVisible();
    await page2.locator('//label[@class="ant-radio-button-wrapper ant-radio-button-wrapper-checked px-6 py-7"]').click();
    await page2.locator('//button[@type="button"]//span[contains(text(),"Authorize Slack")]').click();
}

async VerifySignInClearFeed(page2: Page): Promise<void> {
   await page2.locator('//h2[@class="p-oauth_page__heading"]').isVisible();
   await page2.evaluate(() => {
   window.scrollBy(0, 1000);  
});
   await page2.waitForTimeout(5000);
   await page2.locator('//button[@aria-label="Allow"]').isVisible();
   await page2.locator('//button[@aria-label="Allow"]').click();
}

async VerifyAccountSetUp(page2: Page): Promise<void> {
   await page2.locator('//h2[@class="ant-typography mt-1 mb-1"]').isVisible();
   await page2.locator('//*[contains(text(),"How are you planning to use ClearFeed?")]').isVisible();
   await page2.locator('//*[@class="ant-collapse-header-text"]').isVisible();
   await page2.locator('//*[contains(text(),"Customer Support")]').click();
   await page2.locator('//*[contains(text(),"Step 2")]').isVisible();
   await page2.locator('//*[contains(text(),"Are you planning to use ClearFeed with an integration?")]').isVisible();
   await page2.evaluate(() => {
    window.scrollBy(0, 1000);  
  });
   await page2.locator('//*[@class="ant-radio-input"][@value="STANDALONE"]').click();
   await page2.locator('//span[contains(text(),"Continue")]').click();
}
async VerifyCollection(page2: Page): Promise<void> {
   await page2.locator('//*[@class="ant-typography mt-1 mb-1"]').isVisible();
   await page2.evaluate(() => {
    window.scrollBy(0, 1000);  
   });
   await page2.locator('//*[contains(text(),"Set Up Collection")]').click();
}

async VerifyYouAreAllSetPage(page2: Page): Promise<void> {
   await page2.locator('//*[contains(text(),"You’re all set!")]').isVisible();
   await page2.locator('//a[contains(text(),"Quick cheat sheet")]').isVisible();
   await page2.locator('//*[contains(text(),"Quick video")]').isVisible();
   page2.locator('//*[@class="ant-btn-icon"]');
   const dashboard = page2.locator('//*[contains(text(),"Go to dashboard")]');
   await dashboard.click();
   await page2.waitForLoadState('load');
   await page2.locator('//a//span[text()="Inbox"]').isVisible();
   await page2.waitForLoadState('load');
}

}