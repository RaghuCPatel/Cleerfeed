import { Page, BrowserContext, Locator, expect } from '@playwright/test';
import { WebActions } from "@lib/WebActions";

let webActions: WebActions;

export class LoginPage {
    readonly page: Page;
    readonly context: BrowserContext;
    readonly CONTINUE_WITH_GOOGLE: Locator;
    readonly CONTINUE_WITH_MICROSOFT: Locator;
    readonly CONTINUE_WITH_SAML: Locator;
    readonly EMAIL_EDITBOX: Locator;
    readonly GMAILID_TEXTBOX: Locator;
    readonly ERROR_TEXT: Locator;
    readonly EMPTY_DOMAIN: Locator;
    readonly NEXT_BUTTON: Locator;
    readonly PASSWORD: Locator;
    readonly PASSWORD_ERROR: Locator;
    readonly CLEARFEED_SCREEN: Locator;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
        webActions = new WebActions(this.page, this.context);

        // Initialize locators
        this.CONTINUE_WITH_GOOGLE = page.locator('//*[contains(text(),"Continue with Google")]');
        this.CONTINUE_WITH_MICROSOFT = page.locator('//*[contains(text(),"Continue with Microsoft")]');
        this.CONTINUE_WITH_SAML = page.locator('//*[contains(text(),"Continue with SAML SSO")]');
        this.EMAIL_EDITBOX = page.locator('//*[contains(@class,"login_accountNameInput")]');
        this.GMAILID_TEXTBOX = page.locator('//input[@id="identifierId"]');
        this.ERROR_TEXT = page.locator('//*[contains(text(),"Couldn’t find your Google Account")]');
        this.EMPTY_DOMAIN = page.locator('//*[contains(text(),"Enter an email or phone number")]');
        this.NEXT_BUTTON = page.getByRole('button', { name: 'Next' });
        this.PASSWORD = page.locator('//input[@name="Passwd"]');
        this.PASSWORD_ERROR = page.locator('//*[contains(text(),"Wrong password. Try again or click Forgot")]');
        this.CLEARFEED_SCREEN = page.locator('//a//span[text()="Inbox"]');
    }

    /**Method to Navigate application page */
    async navigateToURL(): Promise<void> {
        await this.page.goto("/");
    }

    /**
     * Method to select LoginType
     * @param loginType 
     */
    async clickOnLoginType(loginType: string): Promise<void> {
        switch (loginType) {
            case "Google":
                await this.CONTINUE_WITH_GOOGLE.click();
                await this.page.waitForTimeout(5000); // Adjust as needed
                break;
            case "Microsoft":
                await this.CONTINUE_WITH_MICROSOFT.click();
                break;
            case "SAML":
                await this.CONTINUE_WITH_SAML.click();
                break;
            case "EMAIL":
                await this.EMAIL_EDITBOX.fill("");
                break;
            default:
                throw new Error(`Unknown login type: ${loginType}`);
        }
    }

    /**
     * Method to Google Login Page
     * @returns 
     */
    async switchToGoogleLoginPage() {
        const [newPage] = await Promise.all([
            this.context.waitForEvent('page'),
            await this.CONTINUE_WITH_GOOGLE.click()
        ]);
        await newPage.waitForLoadState();
        return new exports.LoginPage(newPage);
    }

    /**
     * Navigate to enter Google Login Credential
     * @param email 
     * @param password 
     */
    async loginWithGoogle(email: string, password: string): Promise<void> {
        await this.page.waitForTimeout(5000);
        await this.GMAILID_TEXTBOX.fill(email);
        await this.NEXT_BUTTON.click();
        await this.PASSWORD.waitFor({ state: 'visible', timeout: 20000 });
        await this.PASSWORD.fill(password);
        await this.NEXT_BUTTON.click();
    }

    /**
     * Method to verify google login as an existing user
     */
    async verifyGoogleLogin(): Promise<void> {
        await expect(this.CLEARFEED_SCREEN).toBeVisible({ timeout: 50000 });
    }

}
