const puppeteer = require('puppeteer');
const timeFormat = require('./formating');
const monthFormat = require('./monthFormat');
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

var firestore = admin.firestore();

const url = 'http://anc.apm.activecommunities.com/wcscparksandrec/reservation/search?facilityTypeIds=37';

const browserConfiguration = async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 0 });

    // Cards scrolling
    for (let i = 0; i < 4; i++) {
        const nextPage = await page.$(
            '#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div:nth-child(2) > div.card-section > div > article > div:nth-last-child(1)'
        );
        if (nextPage) {
            await page.evaluate((element) => {
                element.scrollIntoView();
            }, nextPage);
        }
        await page.waitFor(4000);
    }

    // Collecting data

    let scrappedData = {};

    for (let i = 70; i < 80; i++) {
        const cardEl = await page.$(
            `#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div:nth-child(2) > div.card-section > div > article > div:nth-last-child(${i}) > div > div.item-searched__facility-info > div.card-package__card__title > div.item-searched__facility-name > span`
        );
        const cardName = await page.evaluate(
            (cardEl) => cardEl.textContent,
            cardEl
        );
        console.log({ cardName });

        await page.click(
            `#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div:nth-child(2) > div.card-section > div > article > div:nth-last-child(${i})`
        );
        await page.waitFor(3000);

        const monthYear = await page.$(
            '#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div.facility-detail > div > div.an-col.an-col-8-12.an-md-col-1-1.an-sm-col-1-1.an-md-col-order-1.an-sm-col-order-1.module-reservation-form__left > div > div > div.facility-detail__availability-calendar > div > div.an-calendar-toolbar > div.an-calendar-toolbar-actions > span.an-calendar-toolbar-action-btnGroup > span'
        );
        if (monthYear) {
            await page.evaluate((element) => {
                element.scrollIntoView();
            }, monthYear);
        }
        const monthYearEl = await page.$(
            `#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div.facility-detail > div > div.an-col.an-col-8-12.an-md-col-1-1.an-sm-col-1-1.an-md-col-order-1.an-sm-col-order-1.module-reservation-form__left > div > div > div.facility-detail__availability-calendar > div > div.an-calendar-toolbar > div.an-calendar-toolbar-actions > span.an-calendar-toolbar-action-btnGroup > span`
        );
        const monthYearName = await page.evaluate(
            (cardEl) => cardEl.textContent,
            monthYearEl
        );

        const calendar = await page.$(
            '#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div.facility-detail > div > div.an-col.an-col-8-12.an-md-col-1-1.an-sm-col-1-1.an-md-col-order-1.an-sm-col-order-1.module-reservation-form__left > div > div > div.facility-detail__availability-calendar > div > div.an-calendar-day-grid.an-calendar > table > tbody > tr:nth-child(4) > td:nth-child(5) > div'
        );
        if (calendar) {
            await page.evaluate((element) => {
                element.scrollIntoView();
            }, calendar);
        }
        await page.waitFor(5000);
        const hoverEl = await page.$(
            '#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div.facility-detail > div > div.an-col.an-col-8-12.an-md-col-1-1.an-sm-col-1-1.an-md-col-order-1.an-sm-col-order-1.module-reservation-form__left > div > div > div.facility-detail__availability-calendar > div > div.an-calendar-day-grid.an-calendar > table > tbody > tr:nth-child(5) > td:nth-child(2) > div > div.an-calendar-day-body > div > span'
        );
        if (hoverEl) {
            await page.hover(
                '#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div.facility-detail > div > div.an-col.an-col-8-12.an-md-col-1-1.an-sm-col-1-1.an-md-col-order-1.an-sm-col-order-1.module-reservation-form__left > div > div > div.facility-detail__availability-calendar > div > div.an-calendar-day-grid.an-calendar > table > tbody > tr:nth-child(5) > td:nth-child(2) > div > div.an-calendar-day-body > div > span'
            );
            await page.waitFor(5000);
        }

        const data = await page.evaluate(() => {
            const singleTime = document.querySelectorAll(
                '#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div.facility-detail > div > div.an-col.an-col-8-12.an-md-col-1-1.an-sm-col-1-1.an-md-col-order-1.an-sm-col-order-1.module-reservation-form__left > div > div > div.facility-detail__availability-calendar > div > div.an-calendar-day-grid.an-calendar > table > tbody tr td > div'
            );

            if (singleTime) {
                const tds = Array.from(singleTime);
                return tds.map((td) => td.innerText);
            }
        });

        const result = data.filter((e) => e.includes('\n'));

        let courtAvailability = [];
        result.forEach((el) => {
            const dateTimeFormating = el.split('\n');
            const timeFormating = dateTimeFormating[1].split('-');

            courtAvailability.push({
                available_times: [
                    { availability: 'Available' },
                    { end_time: timeFormat(timeFormating[1].trim()) },
                    { start_time: timeFormat(timeFormating[0].trim()) },
                ],
                date: monthFormat(monthYearName, dateTimeFormating[0]),
            });
        });

        const finalFormat = {};
        finalFormat[cardName] = courtAvailability;

        scrappedData = {
            ...scrappedData,
            ...finalFormat,
        };

        courtAvailability = [];

        await page.goBack({ waitUntil: 'load', timeout: 0 });
        await page.waitFor(5000);
        const nextPage = await page.$(
            `#main-content-body > div.layout__container--default.an-main__wrapper > div.an-module-container > div > div:nth-child(2) > div.card-section > div > article > div:nth-last-child(${i})`
        );
        if (nextPage) {
            await page.evaluate((element) => {
                element.scrollIntoView();
            }, nextPage);
        }
    }
    await firestore
        .collection('temp')
        .doc('tennis_courts_data')
        .set(scrappedData);
};

module.exports = browserConfiguration;