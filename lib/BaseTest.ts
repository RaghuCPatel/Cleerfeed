import { TestInfo, test as baseTest } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { WebActions } from '@lib/WebActions';
import AxeBuilder from '@axe-core/playwright';
import { OnboardingPage } from '@pages/OnboardingPage';
import { NewWorkspacePage } from '@pages/NewWorkspacePage';

const test = baseTest.extend<{
    webActions: WebActions;
    loginPage: LoginPage;
    onboardingPage: OnboardingPage;
    newWorkspacePage: NewWorkspacePage;
    makeAxeBuilder: AxeBuilder;
    testInfo: TestInfo;
}>({
    webActions: async ({ page, context }, use) => {
        await use(new WebActions(page, context));
    },
    loginPage: async ({ page, context }, use) => {
        await use(new LoginPage(page, context));
    },
    onboardingPage: async ({ page, context }, use) => {
        await use(new OnboardingPage(page, context));
    },
    newWorkspacePage: async ({ page, context }, use) => {
        await use(new NewWorkspacePage(page, context));
    },
    makeAxeBuilder: async ({ page }, use) => {
        await use(new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .exclude('#commonly-reused-element-with-known-issue'));
    }
})

export default test;