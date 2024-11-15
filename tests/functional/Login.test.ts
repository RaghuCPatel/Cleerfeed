import test from '@lib/BaseTest';

const testData = require('../../Environment_variables/staging/testData.json');

let CFPage;

test(`Verify Login Page`, { tag: '@Smoke'}, async ({ loginPage, webActions }) => {

    await test.step(`Navigate to Application`, async () => {
        await loginPage.navigateToURL();
    });
   
    await test.step(`Enter gmail and password`, async () => {
        const newtab = await loginPage.switchToGoogleLoginPage();
        
        await newtab.loginWithGoogle(testData.ExistingUserEmail,await webActions.decipherPassword(testData.sandBoxPassword));
    });

    await test.step(`Verify if ClearFeed Home Page is displayed using Google Login`, async () => {
        await loginPage.VerifyGoogleLogin();
    });

 });

 
 test(`Enter email with incorrect domain`, { tag: '@Smoke'}, async ({ loginPage, webActions }) => {
        await loginPage.navigateToURL();
        const newtab = await loginPage.switchToGoogleLoginPage();
        await newtab.loginWithinvalidDomain(testData.InvalidDomain);
        await newtab.VerifyinvalidDomainError();
    });

 test(`Enter email with correct domain but incorrect password`,  { tag: '@Smoke'}, async ({ loginPage, webActions }) => {
        await loginPage.navigateToURL();
        const googleLoginPage = await loginPage.switchToGoogleLoginPage();
        await googleLoginPage.loginWithGoogle(testData.UserEmail,await webActions.decipherPassword(testData.invalidPassword)); 
    });

 test(`Leave email field empty and try to proceed`,  { tag: '@Smoke'}, async ({ loginPage, webActions }) => {
        await loginPage.navigateToURL();
        const googleLoginPage = await loginPage.switchToGoogleLoginPage();
        await googleLoginPage.loginWithinvalidDomain("");
    });