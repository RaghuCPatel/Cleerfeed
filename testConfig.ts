export const testConfig = {
    qa: `https://demoqa.com`,
    stage: 'https://staging.aws.clearfeed.app',
    dev: ``,
    qaApi: ``,
    stageApi: `https://staging-api.aws.clearfeed.app`,
    devApi: ``,
    waitForElement: 2000,
    dbUsername: ``,
    dbPassword: ``,
    dbServerName: ``,
    dbPort: ``,
    dbName: ``
};

// Dynamically export the environment based on passed ENV
export const getEnvConfig = (env: string) => {
    switch (env) {
        case 'qa':
            return testConfig.qa;
        case 'stage':
            return testConfig.stage;
        case 'dev':
            return testConfig.dev;
        default:
            throw new Error(`Unknown environment: ${env}`);
    }
};
