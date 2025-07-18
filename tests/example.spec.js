const { test, expect } = require('@playwright/test');
import nodemailer from 'nodemailer';
const emailList = [
    'raneeshap@techcedence.com',
    'sakanar@techcedence.com'

];




const transporter = nodemailer.createTransport({
    service: "gmail",
    // STARTTLS
    auth: {
        user: 'dummyemailforuse508@gmail.com',
        pass: 'ldqv sdoq drgz ihku '
    },
    tls: {
        rejectUnauthorized: false // 👈 Allow self-signed certs (use only in dev)
    }
});










// ✅ Step 3: Loop through emails and send
async function sendEmails() {
    for (const recipient of emailList) {
        try {
            const info = await transporter.sendMail({
                from: 'Hi ${recipient}', // Sender address
                to: recipient,
                subject: 'Techcedence Timesheet Reminder',
                html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f8fa;
      margin: 0;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      max-width: 600px;
      margin: auto;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .button {
      background-color: #007bff;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
      margin-top: 20px;
    }
    .footer {
      font-size: 12px;
      color: #999999;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔔 Timesheet Reminder</h2>
    <p>Dear ${recipient},</p>

    <p>This is a gentle reminder to submit your timesheet for the current week. Timely submission helps in accurate payroll processing and project tracking.</p>

    <p>Please click the button below to access the timesheet portal:</p>

    <a class="button" href="https://opensource.techcedence.net/lcp-trac-projects/#/" target="_blank">Submit Timesheet</a>

    <p>If you have already submitted your timesheet, kindly ignore this message.</p>

    <p>Thank you!<br>
    QA Team</p>

    <div class="footer">
      © 2025 Your Company. All rights reserved.
    </div>
  </div>
</body>
</html>
`
            });
            console.log(`✅ Email sent to ${recipient}: ${info.response}`);
        } catch (err) {
            console.error(`❌ Failed to send email to ${recipient}:`, err.message);
        }
    }
}
test.describe('App Flow (Single Browser Session)', () => {
    let page;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext({

        });
        page = await context.newPage();

        // Login once before all tests
        await page.goto('https://opensource.techcedence.net/lcp-trac-projects/#/login');
        await page.fill('//input[@type="email"]', 'praveenk@techcedence.com');
        await page.fill('//input[@type="password"]', 'Test@1234');
        await page.click("//button[text()=' submit ']");

    });

    test('Login with valid credentials and validate the homepage is loaded', async () => {
        await page.goto('https://opensource.techcedence.net/lcp-trac-projects/#/');

        await expect(page).toHaveTitle('Dashboard');

    });
    test('Get the user not submitted', async () => {
        await page.goto('https://opensource.techcedence.net/lcp-trac-projects/#/');
        //await expect(page).toHaveTitle('Timesheet');
        await expect(page.locator("//a[@data-entity='submitted_list']")).toBeVisible();
        await page.click("//a[@data-entity='submitted_list']");

        await page.waitForSelector('table');

        // Extract values from "Name" column (2nd column)
        const nameColumnCells = await page.locator('table tbody tr td:nth-child(2)');
        const count = await nameColumnCells.count();

        for (let i = 0; i < count; i++) {
            const name = await nameColumnCells.nth(i).textContent();
            console.log(`Name ${i + 1}:`, name?.trim());
        }
        await sendEmails();
    });


    //   test('Profile link works', async () => {
    //     await page.click('nav >> text=Profile');
    //     await expect(page).toHaveURL(/.*\/profile/);
    //   });
});


// ✅ Step 2: Create reusable transporter (Gmail example)
