import rimraf from "rimraf";

let CFPage;

async function globalSetup(): Promise<void> {
    await new Promise(resolve => {
        rimraf(`./allure-results`, resolve);
    });

}

export default globalSetup;