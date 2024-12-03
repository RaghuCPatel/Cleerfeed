import { Page } from '@playwright/test';

import test from '@lib/BaseTest';

import testData from '../../Environment_variables/staging/onBoardingTestData.json' assert { type: 'json' };

let CFPage: Page;

test.describe('ClearFeed Onboarding Tests', () => {
  test.skip(
    'Verify Onboarding Page with Magic Link  Using Customer Support and Standalone helpdesk',
    { tag: '@Smoke' },
    async ({ newWorkspacePage, onboardingPage }) => {
      await test.step('Navigate to existing Slack workspace', async () => {
        await newWorkspacePage.navigateToSlackAndClickGoogle();
      });
      await test.step('Navigate to ClearFeed application Using Magic link', async () => {
        CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
        await onboardingPage.loginToClearFeedWithGoogle(CFPage);
        await onboardingPage.verifyHaveYouHerePage(
          CFPage,
          Number(testData.phone),
          testData.countryCode,
        );
        await onboardingPage.verifyGloveSupportOpt(CFPage);
        await onboardingPage.verifyAuthorizeSlack(CFPage);
        await onboardingPage.verifySignInClearFeed(CFPage);
        await onboardingPage.verifyAccountSetUp(
          CFPage,
          testData.customerSupport,
        );
        await onboardingPage.verifyCollection(CFPage);
        await onboardingPage.verifyYouAreAllSetPage(CFPage);
      });
    },
  );

  test.skip(
    'Verify Onboarding Page with Magic Link Using Employee Support and Standalone helpdesk',
    { tag: '@Smoke' },
    async ({ newWorkspacePage, onboardingPage }) => {
      await test.step('Navigate to existing Slack workspace', async () => {
        await newWorkspacePage.navigateToSlackAndClickGoogle();
      });
      await test.step('Navigate to ClearFeed application Using Magic link', async () => {
        CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
        await onboardingPage.loginToClearFeedWithGoogle(CFPage);
        await onboardingPage.verifyHaveYouHerePage(
          CFPage,
          Number(testData.phone),
          testData.countryCode,
        );
        await onboardingPage.verifyGloveSupportOpt(CFPage);
        await onboardingPage.verifyAuthorizeSlack(CFPage);
        await onboardingPage.verifySignInClearFeed(CFPage);
        await onboardingPage.verifyAccountSetUp(
          CFPage,
          testData.employeeSupport,
        );
        await onboardingPage.verifyCollection(CFPage);
        await onboardingPage.verifyYouAreAllSetPage(CFPage);
      });
    },
  );

  test(
    'Verify Onboarding Page with Magic Link Using Customer Support and Standalone helpdesk without selecting Glove support opt',
    { tag: '@Smoke' },
    async ({ newWorkspacePage, onboardingPage }) => {
      await test.step('Navigate to existing Slack workspace', async () => {
        await newWorkspacePage.navigateToSlackAndClickGoogle();
      });
      await test.step('Navigate to ClearFeed application Using Magic link', async () => {
        CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
        await onboardingPage.loginToClearFeedWithGoogle(CFPage);
        await onboardingPage.verifyHaveYouHerePage(
          CFPage,
          Number(testData.phone),
          testData.countryCode,
        );
        await onboardingPage.clickOnGloveSupportOpt(CFPage);
        await onboardingPage.verifyAuthorizeSlack(CFPage);
        await onboardingPage.verifySignInClearFeed(CFPage);
        await onboardingPage.verifyAccountSetUp(
          CFPage,
          testData.customerSupport,
        );
        await onboardingPage.verifyCollection(CFPage);
        await onboardingPage.verifyYouAreAllSetPage(CFPage);
      });
    },
  );

  test(
    'Verify Onboarding Page with Magic Link Using Employee Support and Standalone helpdesk without selecting Glove support opt',
    { tag: '@Smoke' },
    async ({ newWorkspacePage, onboardingPage }) => {
      await test.step('Navigate to existing Slack workspace', async () => {
        await newWorkspacePage.navigateToSlackAndClickGoogle();
      });
      await test.step('Navigate to ClearFeed application Using Magic link', async () => {
        CFPage = await onboardingPage.navigateToClearFeedAndClickGoogle();
        await onboardingPage.loginToClearFeedWithGoogle(CFPage);
        await onboardingPage.verifyHaveYouHerePage(
          CFPage,
          Number(testData.phone),
          testData.countryCode,
        );
        await onboardingPage.clickOnGloveSupportOpt(CFPage);
        await onboardingPage.verifyAuthorizeSlack(CFPage);
        await onboardingPage.verifySignInClearFeed(CFPage);
        await onboardingPage.verifyAccountSetUp(
          CFPage,
          testData.employeeSupport,
        );
        await onboardingPage.verifyCollection(CFPage);
        await onboardingPage.verifyYouAreAllSetPage(CFPage);
      });
    },
  );

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
