import test from '@lib/BaseTest';
import { deleteAccountAPI } from 'tests/api/API.test';
import { chromium } from 'playwright-extra';
import stealth from 'playwright-extra-plugin-stealth';

chromium.use(stealth);

const testData = require('../../Environment_variables/staging/testData.json');


let CFPage;

test.describe('ClearFeed Tests', () => {
   test(`Verify Login Page with new Google user`, { tag: '@Smoke'}, async ({ newWorkspacePage,onboardingPage, webActions}) => {

    await test.step(`Navigate to existing Slack workspace`, async () => {
        await newWorkspacePage.navigateToSlackAndClickGoogle();
    });
   
   await test.step(`Navigate to ClearFeed application and Enter Google credentials`, async () => {
        CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
        await onboardingPage.loginToClearFeedWithGoogle(CFPage,testData.UserEmail, await webActions.decipherPassword(testData.password));
        await onboardingPage.verifyHaveYouHerePage(CFPage, 7676767676, "india");
        await onboardingPage.VerifyAuthorizeSlack(CFPage);
        await onboardingPage.VerifySignInClearFeed(CFPage);
        await onboardingPage.VerifyAccountSetUp(CFPage);
        await onboardingPage.VerifyCollection(CFPage);
        await onboardingPage.VerifyYouAreAllSetPage(CFPage);
   });

 });


 test.afterEach(async ({ page, context}) => {
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
      await deleteAccountAPI(accountId, page,context);
      console.log('Account with ID', accountId, 'has been deleted.');
  } else {
      console.log('No accountId found, skipping user deletion.');
  }
});

});
