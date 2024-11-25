import test from '@lib/BaseTest';
import testData from '../../Environment_variables/staging/onBoardingTestData.json';

let CFPage;

test.describe('ClearFeed Onboarding Tests', () => {
    test(`Verify Login Page with new Google user Using Customer Support and Standalone helpdesk`, { tag: '@Smoke' }, async ({ newWorkspacePage, onboardingPage, webActions }) => {
        await test.step(`Navigate to existing Slack workspace`, async () => {
            await newWorkspacePage.navigateToSlackAndClickGoogle();
        });
        await test.step(`Navigate to ClearFeed application and Enter Google credentials`, async () => {
            CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
            await onboardingPage.loginToClearFeedWithGoogle(CFPage, testData.UserEmail, await webActions.decipherPassword(testData.password));
            await onboardingPage.verifyHaveYouHerePage(CFPage, Number(testData.phone), "india");
            await onboardingPage.verifyGloveSupportOpt(CFPage)
            await onboardingPage.verifyAuthorizeSlack(CFPage);
            await onboardingPage.verifySignInClearFeed(CFPage);
            await onboardingPage.verifyAccountSetUp(CFPage, "Customer Support");
            await onboardingPage.verifyCollection(CFPage);
            await onboardingPage.verifyYouAreAllSetPage(CFPage);
        });
    });

    test(`Verify Login Page with new Google user Using Employee Support and Standalone helpdesk`, { tag: '@Smoke' }, async ({ newWorkspacePage, onboardingPage, webActions }) => {
        await test.step(`Navigate to existing Slack workspace`, async () => {
            await newWorkspacePage.navigateToSlackAndClickGoogle();
        });
        await test.step(`Navigate to ClearFeed application and Enter Google credentials`, async () => {
            CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
            await onboardingPage.loginToClearFeedWithGoogle(CFPage, testData.UserEmail, await webActions.decipherPassword(testData.password));
            await onboardingPage.verifyHaveYouHerePage(CFPage, Number(testData.phone), "india");
            await onboardingPage.verifyGloveSupportOpt(CFPage)
            await onboardingPage.verifyAuthorizeSlack(CFPage);
            await onboardingPage.verifySignInClearFeed(CFPage);
            await onboardingPage.verifyAccountSetUp(CFPage, "Employee Support");
            await onboardingPage.verifyCollection(CFPage);
            await onboardingPage.verifyYouAreAllSetPage(CFPage);
        });
    });

    test(`Verify Login Page with new Google user Using Customer Support and Standalone helpdesk without selecting Glove support opt `, { tag: '@Smoke' }, async ({ newWorkspacePage, onboardingPage, webActions }) => {
        await test.step(`Navigate to existing Slack workspace`, async () => {
            await newWorkspacePage.navigateToSlackAndClickGoogle();
        });
        await test.step(`Navigate to ClearFeed application and Enter Google credentials`, async () => {
            CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
            await onboardingPage.loginToClearFeedWithGoogle(CFPage, testData.UserEmail, await webActions.decipherPassword(testData.password));
            await onboardingPage.verifyHaveYouHerePage(CFPage, Number(testData.phone), "india");
            await onboardingPage.clickOnGloveSupportOpt(CFPage);
            await onboardingPage.verifyAuthorizeSlack(CFPage);
            await onboardingPage.verifySignInClearFeed(CFPage);
            await onboardingPage.verifyAccountSetUp(CFPage, "Customer Support");
            await onboardingPage.verifyCollection(CFPage);
            await onboardingPage.verifyYouAreAllSetPage(CFPage);
        });
    });

    test(`Verify Login Page with new Google user Using Employee Support and Standalone helpdesk without selecting Glove support opt`, { tag: '@Smoke' }, async ({ newWorkspacePage, onboardingPage, webActions }) => {
        await test.step(`Navigate to existing Slack workspace`, async () => {
            await newWorkspacePage.navigateToSlackAndClickGoogle();
        });
        await test.step(`Navigate to ClearFeed application and Enter Google credentials`, async () => {
            CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
            await onboardingPage.loginToClearFeedWithGoogle(CFPage, testData.UserEmail, await webActions.decipherPassword(testData.password));
            await onboardingPage.verifyHaveYouHerePage(CFPage, Number(testData.phone), "india");
            await onboardingPage.clickOnGloveSupportOpt(CFPage);
            await onboardingPage.verifyAuthorizeSlack(CFPage);
            await onboardingPage.verifySignInClearFeed(CFPage);
            await onboardingPage.verifyAccountSetUp(CFPage, "Employee Support");
            await onboardingPage.verifyCollection(CFPage);
            await onboardingPage.verifyYouAreAllSetPage(CFPage);
        });
    });

    test.afterEach(async ({ page, context, onboardingPage }) => {
        let accountId: string | null = null;
        if (CFPage) {
            await CFPage.reload();
            accountId = await CFPage.evaluate(() => {
                return window.localStorage.getItem('accountId');
            });
        }
        console.log('Account ID:', accountId);
        if (accountId) {
            console.log('Deleting account with ID:', accountId);
            await onboardingPage.deleteAccountAPI(accountId, page, context);
            console.log('Account with ID', accountId, 'has been deleted.');
        } else {
            console.log('No accountId found, skipping user deletion.');
        }
    });

});
