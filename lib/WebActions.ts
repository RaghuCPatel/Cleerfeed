import fs from 'fs';
import * as CryptoJS from 'crypto-js';
import { randomInt } from 'crypto';
import type { Page } from '@playwright/test';
import { BrowserContext } from '@playwright/test';
import { Workbook } from 'exceljs';
import * as pdfjslib from 'pdfjs-dist-es5';
import qaTestData from '../Environment_variables/staging/onBoardingTestData.json';
import MailSlurp from 'mailslurp-client';
import * as cheerio from 'cheerio';

let testData = qaTestData;

let mailslurp;
let inboxId;

export class WebActions {
    readonly page: Page;
    readonly context: BrowserContext;

    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;
    }

    async decipherPassword(password: string): Promise<string> {
        const key = `SECRET`;
        return CryptoJS.AES.decrypt(password, key).toString(CryptoJS.enc.Utf8);

    }

    async decipherToken(): Promise<string> {
        const key = `SECRET`;
        const bytes = CryptoJS.AES.decrypt(qaTestData.token, key);
        const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedToken;

    }

    async delay(time: number): Promise<void> {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    }

    async clickByText(text: string): Promise<void> {
        await this.page.getByText(text, { exact: true }).click();  //Matches locator with exact text and clicks
    }

    async clickElementJS(locator: string): Promise<void> {
        await this.page.$eval(locator, (element: HTMLElement) => element.click());
    }

    async readDataFromExcel(fileName: string, sheetName: string, rowNum: number, cellNum: number): Promise<string> {
        const workbook = new Workbook();
        return workbook.xlsx.readFile(`./Downloads/${fileName}`).then(function () {
            const sheet = workbook.getWorksheet(sheetName);
            return sheet.getRow(rowNum).getCell(cellNum).toString();
        });
    }

    async readValuesFromTextFile(filePath: string): Promise<string> {
        return fs.readFileSync(`${filePath}`, `utf-8`);
    }

    async writeDataIntoTextFile(filePath: number | fs.PathLike, data: string | NodeJS.ArrayBufferView): Promise<void> {
        fs.writeFile(filePath, data, (error) => {
            if (error)
                throw error;
        });
    }

    async getPdfPageText(pdf: any, pageNo: number) {
        const page = await pdf.getPage(pageNo);
        const tokenizedText = await page.getTextContent();
        const pageText = tokenizedText.items.map((token: any) => token.str).join('');
        return pageText;
    }

    async getPDFText(filePath: any): Promise<string> {
        const dataBuffer = fs.readFileSync(filePath);
        const pdf = await pdfjslib.getDocument(dataBuffer).promise;
        const maxPages = pdf.numPages;
        const pageTextPromises = [];
        for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
            pageTextPromises.push(this.getPdfPageText(pdf, pageNo));
        }
        const pageTexts = await Promise.all(pageTextPromises);
        return pageTexts.join(' ');
    }

    async generateRandomString(length: number) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let result = '';
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            const randomIndex = randomValues[i] % charactersLength;
            result += characters[randomIndex];
        }
        return result;
    }

    async getCryptoRandomNumber(min: number, max: number): Promise<number> {
        return randomInt(min, max + 1);
    }

    async createMailslurpInbox() {
        mailslurp = new MailSlurp({ apiKey: testData.apiKey });
        const customEmail = testData.userEmail;
        const createdinbox = await mailslurp.createInbox(customEmail);
        inboxId = createdinbox.id;
    }

    async extractLink() {
        const inbox = await mailslurp.waitForLatestEmail(inboxId, 10000);
        const loc = cheerio.load(inbox.body);
        const link = loc('a').attr('href');
        return link;
    }

    async deleteInbox() {
        await mailslurp.deleteInbox(inboxId);
    }

    async extractOTP() {
        const inbox = await mailslurp.waitForLatestEmail(inboxId, 10000);
        const parts = inbox.subject.split(" ");
        const otp = parts[parts.length - 1];
        return otp;
    }

}