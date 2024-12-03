import { Page, BrowserContext, expect } from '@playwright/test';
import axios from 'axios';

import { WebActions } from '@lib/WebActions';

import qaTestData from '../../Environment_variables/staging/onBoardingTestData.json';
import { testConfig } from '../../testConfig';

const envurl = testConfig.stageApi;

let webActions: WebActions;
const testData = qaTestData;
let requestchannelname: string;

export class OnboardingPage {
  readonly page: Page;
  readonly context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    webActions = new WebActions(this.page, this.context);
  }

  /**
   * Method to navigate application page
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
  async loginWithGoogle(page2: Page) {
    await page2.locator('//input[@id="email"]').fill(testData.userEmail);
    await page2
      .locator('//span[contains(text(),"Send login link to email")]')
      .click();
    await page2.waitForTimeout(2000);
    const page5 = await this.context.newPage();
    await page5.goto(await webActions.extractLink());
    await webActions.deleteInbox();
    await page2.waitForTimeout(3000);
    await page5.close();
  }

  /**
   * Method to verify account setup title
   * @param cfpage
   */
  async loginToClearFeedWithGoogle(cfpage: Page) {
    await this.loginWithGoogle(cfpage);
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
  async verifyHaveYouHerePage(
    page2: Page,
    phone: number,
    code: string,
  ): Promise<void> {
    await page2.locator('(//*[contains(text(),"Step")])[1]').isVisible();
    await page2
      .locator('//h2[contains(text(),"Great to have you here")]')
      .isVisible();
    await page2
      .locator(
        '//*[contains(text(),"Let’s get your account set up in a few steps")]',
      )
      .isVisible();
    await page2
      .locator('//*[contains(text(),"How did you hear about ClearFeed?")]')
      .isVisible();
    await page2.locator('//button[@type="submit"]').click();
    await page2
      .locator(
        '//*[contains(text(),"Please specify how you heard about ClearFeed")]',
      )
      .isVisible();
    await page2
      .locator('//*[contains(text(),"Please specify your use case")]')
      .isVisible();
    await page2
      .locator('//*[contains(text(),"Please enter a valid phone number")]')
      .isVisible();
    await page2
      .locator('//*[contains(text(),"Opt in for White Glove Support")]')
      .isVisible();
    await this.selectRandomRadioButtonByCSS(page2);
    await page2
      .locator('//*[contains(text(),"Describe your use case")]')
      .isVisible();
    await this.selectRandomRadioButonForCase(page2);
    await page2.evaluate(() => window.scrollBy(0, 1000));
    await page2.locator('//*[contains(text(),"Phone")]').isVisible();
    await page2.locator('//div[@class="ant-select-selector"]').click();
    await page2
      .locator('//input[@id="primary_contact_info_country_code"]')
      .fill(code);
    await page2.locator('text=[IN] India +91').click();
    await page2.locator('//input[@placeholder="Your number"]').fill('');
    await page2.locator('//button[@type="submit"]').click();
    await page2
      .locator('//div[contains(text(),"Please enter a valid phone number")]')
      .isVisible();
    await page2
      .locator('//input[@placeholder="Your number"]')
      .fill(phone.toString());
  }

  /**
   * Method to verify Great Company link
   * @param page2
   */
  async verifyGreatCompany(page2: Page) {
    await page2
      .locator('//h1[contains(text(),"You are in great company")]')
      .isVisible();
    const greatCompany = await page2.$$('//div[@class="ant-image"]//img');
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
    const hearAboutClearfeedOpt = await page2.$$(
      '//div[@id="cf_discovery_source_source"]//span/preceding-sibling::input[@type=\'radio\']',
    );
    for (let i = 0; i < hearAboutClearfeedOpt.length; i++) {
      await hearAboutClearfeedOpt[i].click();
    }
    await page2
      .locator('//input[@id="cf_discovery_source_other_source"]')
      .isVisible();
    const randomValue: string = testData.radioButtonValues[0];
    const selector: string = `//div[@id="cf_discovery_source_source"]//span/preceding-sibling::input[@type='radio'][@value="${randomValue}"]`;
    await page2.waitForSelector(selector, { timeout: 90000 });
    const radioButton = page2.locator(selector);
    await radioButton.isVisible();
    await radioButton.click();
    await page2.waitForTimeout(3000);
  }

  /**
   * Method to verify teams
   * @param page2
   */
  async selectRandomRadioButonForCase(page2: Page): Promise<void> {
    await page2
      .locator('//*[contains(text(),"Which team are you a part of?")]')
      .isVisible();
    const teamOpt = await page2.$$(
      '//div[@id="account_use_case_use_case"]//span/preceding-sibling::input[@type="radio"]',
    );
    for (let i = 0; i < teamOpt.length; i++) {
      await teamOpt[i].check();
    }
    await page2
      .locator('//input[@placeholder="Tell us your use case"]')
      .isVisible();
    const randomValue: string = testData.radioButtonValuesForCase[0];
    const selector: string = `//div[@id="account_use_case_use_case"]//span/preceding-sibling::input[@type="radio"][@value="${randomValue}"]`;
    await page2.waitForSelector(selector, { timeout: 7000 });
    const radioButton = page2.locator(selector);
    await radioButton.isVisible();
    await radioButton.click();
    await page2.waitForTimeout(3000);
  }

  /**
   * Method to verify Install ClearFeed App Page
   * @param page2
   */
  async verifyAuthorizeSlack(page2: Page): Promise<void> {
    await page2.locator('(//*[contains(text(),"Step")])[1]').isVisible();
    await page2
      .locator('//h2[contains(text(),"Install ClearFeed App")]')
      .isVisible();
    await page2
      .locator('//label[@class="ant-radio-button-wrapper px-6 py-7"]')
      .isVisible();
    await page2
      .locator(
        '//label[@class="ant-radio-button-wrapper ant-radio-button-wrapper-checked px-6 py-7"]',
      )
      .click();
    await page2
      .locator(
        '(//*[contains(text(),"Don\'t have permission to add apps to Slack ? ")])[1]',
      )
      .isVisible();
    await page2.locator('//div[@class="ant-typography-copy"]').isVisible();
    await page2.locator('//div[@class="ant-typography-copy"]').click();
    await this.verifySecureFromDayOne(page2, 1);
    await page2
      .locator(
        '//button[@type="button"]//span[contains(text(),"Authorize Slack")]',
      )
      .click();
  }

  /**
   * Method to verify Secure From Day One images and links
   * @param page2
   * @param index
   */
  async verifySecureFromDayOne(page2: Page, index: number) {
    await page2.locator(`(//*[contains(text(),"Step")])[${index}]`).isVisible();
    const secureData = await page2.$$('//div[@class="ant-image"]//img');
    for (let i = 0; i < secureData.length; i++) {
      await secureData[i].isVisible();
    }
    const privacyLink = await page2.$$('//div[@class="ant-col mb-1"]');
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
    const clearfeedStagingSections = await page2.$$(
      '//section[@class="p-scope_info__section"]',
    );
    for (let i = 0; i < clearfeedStagingSections.length; i++) {
      await clearfeedStagingSections[i].isVisible();
    }
    await page2.locator('//button[@aria-label="Allow"]').isVisible();
    await page2.locator('//button[@aria-label="Allow"]').click();
    await page2.waitForTimeout(10000);
  }

  /**
   * Method to verify onboarding page using standalone helpdesk
   * @param page2
   * @param accountSetup
   */
  async verifyAccountSetUp(page2: Page, accountSetup: string): Promise<void> {
    await page2.locator('//h2[@class="ant-typography mt-1 mb-1"]').isVisible();
    await page2
      .locator('//*[contains(text(),"How do you plan to use ClearFeed?")]')
      .isVisible();
    await page2.locator(`//*[contains(text(),"${accountSetup}")]`).click();
    await page2.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    await page2
      .locator('//*[@class="ant-radio-input"][@value="STANDALONE"]')
      .click();
    await this.verifySecureFromDayOne(page2, 2);
    await page2.locator('//span[contains(text(),"Continue")]').click();
  }

  /**
   * Method to create a requestChannel and triageChannel
   * @param page2
   */
  async verifyCollection(page2: Page): Promise<void> {
    await page2.locator('//*[@class="ant-typography mt-1 mb-1"]').isVisible();
    const slackLinks = await page2.$$(
      '//ul[@class="my-1 mb-6 px-6 text-neutral-700"]//li',
    );
    for (let i = 0; i < slackLinks.length; i++) {
      await slackLinks[i].isVisible();
    }
    await this.verifyRequestChannelImg(page2, 2);
    await page2
      .locator('//input[@id="requestChannelName"]')
      .fill('igs' + (await webActions.getCryptoRandomNumber(1, 100)));
    requestchannelname = await page2
      .locator('//input[@id="requestChannelName"]')
      .getAttribute('value');
    await page2.locator('//span[contains(text(),"Continue")]').click();
    await page2.locator('//*[@class="ant-typography mt-1 mb-1"]').isVisible();
    await this.verifyRequestChannelImg(page2, 2);
    await page2
      .locator('//input[@id="triageChannelName"]')
      .fill('igsindia' + (await webActions.getCryptoRandomNumber(1, 100)));
    await page2
      .locator('//input[@id="triageChannelName"]')
      .getAttribute('value');
    await page2.locator('//span[contains(text(),"Continue")]').click();
    await page2.locator('//*[@class="ant-typography mt-1 mb-1"]').isVisible();
    await this.verifyRequestChannelImg(page2, 2);
    await page2.locator('//*[contains(text(),"Email Addresses")]').isVisible();
    await page2.locator('//*[contains(text(),"+ Add Invite")]').click();
    await page2.locator('(//button[@type="button"])[1]').isVisible();
    await page2
      .locator('//input[@id="dynamic_form_nest_item_users_0_email"]')
      .fill(testData.addInvite);
    await page2.locator('//*[contains(text(),"Submit")]').click();
    await page2.locator('//div[@class="ant-alert-message"]').isVisible();
    await page2.locator('//span[contains(text(),"Skip")]').click();
  }

  /**
   * Method to verify Request channel image
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
    await page2
      .locator('//a[contains(text(),"Quick cheat sheet")]')
      .isVisible();
    await page2.locator('//*[contains(text(),"Quick video")]').isVisible();
    await page2
      .locator('//span[contains(text(),"Reach out to us via Slack Connect")]')
      .isVisible();
    await page2.locator('//span[contains(text(),"Send Invite")]').isEnabled();
    await page2
      .locator('//span[contains(text(),"Reach out to us via Chat")]')
      .isVisible();
    await page2.locator('//span[contains(text(),"Chat Now")]').isEnabled();
    await page2
      .locator('//span[contains(text(),"Set up an onboarding call with us")]')
      .isVisible();
    await page2.locator('//span[contains(text(),"Schedule")]').isEnabled();
    await page2
      .locator('//button[@aria-label="Open Beacon popover"]')
      .isVisible();
    const dashboard = page2.locator('//*[contains(text(),"Go to dashboard")]');
    await dashboard.click();
    await page2.waitForTimeout(5000);
    const actRequestedChannelname = await page2
      .locator('//span[@class="break-word"]')
      .textContent();
    expect(actRequestedChannelname).toContain(requestchannelname);
    await page2.waitForLoadState('load');
    await page2.locator('//span[text()="Inbox"]').isVisible();
    await page2.waitForLoadState('load');
  }

  /**
   * Method for delete account id
   * @param accountId
   * @param page
   * @param context
   */
  async deleteAccountAPI(
    accountId: string,
    page: Page,
    context: BrowserContext,
  ) {
    const webActions = new WebActions(page, context);
    const token = await webActions.decipherToken();
    const response = await axios.delete(
      envurl + `/super-admin/api/account/${accountId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    expect(response.status).toBe(200);
  }
}
