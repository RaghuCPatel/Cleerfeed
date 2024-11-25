import test from '@lib/BaseTest';
import testData from '../../Environment_variables/staging/onBoardingTestData.json';

let CFPage;

test.describe('ClearFeed Onboarding E2E Tests', () => {
    test.only(`Verify Created Channel,Request,Workflow and Collection Settings Using Customer Support and Standalone helpdesk`, { tag: '@Smoke' }, async ({ newWorkspacePage, onboardingPage, webActions }) => {
        await test.step(`Navigate to existing Slack workspace`, async () => {
            await newWorkspacePage.navigateToSlackAndClickGoogle();
        });
        await test.step(`Navigate to ClearFeed application and Enter Google credentials`, async () => {
            CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
            await onboardingPage.loginToClearFeedWithGoogle(CFPage, testData.UserEmail, await webActions.decipherPassword(testData.password));
            await onboardingPage.verifyHaveYouHerePage(CFPage, Number(testData.phone), "india");
            await onboardingPage.verifyGreatCompany(CFPage);
            await onboardingPage.verifyGloveSupportOpt(CFPage);
            await onboardingPage.verifyAuthorizeSlack(CFPage);
            await onboardingPage.verifySignInClearFeed(CFPage);
            await onboardingPage.verifyAccountSetUpByUsingExternalTools(CFPage);
            await onboardingPage.verifyAccountSetUp(CFPage, "Customer Support");
            await onboardingPage.verifyCollection(CFPage);
            await onboardingPage.navigateBack(CFPage)
            await newWorkspacePage.againNavigateToCF();
            await onboardingPage.verifyYouAreAllSetPage(CFPage);
            await onboardingPage.verifyDashboardAndCreateRequst(CFPage);
            await onboardingPage.verifyWorkflow(CFPage);
            await onboardingPage.verifyCollectionSetting(CFPage);
            await onboardingPage.verifyRequestChannel(CFPage, 3);
        });
    });

    
    test.only(`Verify Created Channel,Workflow and Collection Settings Using Employee Support and Standalone helpdesk`, { tag: '@Smoke' }, async ({ newWorkspacePage, onboardingPage, webActions }) => {
        await test.step(`Navigate to existing Slack workspace`, async () => {
            await newWorkspacePage.navigateToSlackAndClickGoogle();
        });
        await test.step(`Navigate to ClearFeed application and Enter Google credentials`, async () => {
            CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
            await onboardingPage.loginToClearFeedWithGoogle(CFPage, testData.UserEmail, await webActions.decipherPassword(testData.password));
            await onboardingPage.verifyHaveYouHerePage(CFPage, Number(testData.phone), "india");
            await onboardingPage.verifyGreatCompany(CFPage);
            await onboardingPage.verifyGloveSupportOpt(CFPage);
            await onboardingPage.verifyAuthorizeSlack(CFPage);
            await onboardingPage.verifySignInClearFeed(CFPage);
            await onboardingPage.verifyAccountSetUpByUsingExternalTools(CFPage);
            await onboardingPage.verifyAccountSetUp(CFPage, "Employee Support");
            await onboardingPage.verifyCollection(CFPage);
            await onboardingPage.navigateBack(CFPage);
            await newWorkspacePage.againNavigateToCF();
            await onboardingPage.verifyYouAreAllSetPage(CFPage);
            await onboardingPage.clickOnCloseIcon(CFPage, 2);
            await onboardingPage.verifyWorkflow(CFPage);
            await onboardingPage.verifyCollectionSetting(CFPage);
            await onboardingPage.verifyRequestChannel(CFPage, 1);
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
