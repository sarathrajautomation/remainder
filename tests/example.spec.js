const { test, expect } = require('@playwright/test');
import nodemailer from 'nodemailer';
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

let emailList = [


];

let Week;

let table = {};


const transporter = nodemailer.createTransport({
    service: "gmail",
    // STARTTLS
    auth: {
        user: "pkpraveen082@gmail.com",
        pass: "frxp bdqo mmaz yjbo",
    },
    tls: {
        rejectUnauthorized: false // 👈 Allow self-signed certs (use only in dev)
    }
});

function convertintoJson(table) {

    const rows = table.trim().split("\n");

    // Extract headers from the first row
    const headers = rows[0].trim().split(/\s{2,}|\t+/);

    // Process each row into an object
    const json = rows.slice(1).map(row => {
        const values = row.trim().split(/\s{2,}|\t+/);
        return headers.reduce((acc, header, i) => {
            acc[header] = values[i];
            return acc;
        }, {});
    });

    return json


}

async function sendEmailWithAttachment(to, subject, body, attachmentPath) {
    const transporter = nodemailer.createTransport({
        service: "gmail", // or "outlook", "yahoo"
        auth: {
            user: "pkpraveen082@gmail.com",
            pass: "frxp bdqo mmaz yjbo", // Use app password, not regular password
        },
        tls: {
            rejectUnauthorized: false // 👈 Allow self-signed certs (use only in dev)
        }
    });

    const mailOptions = {
        from: "QA Team",
        to: to,
        subject: subject,
        text: body,
        attachments: [
            {
                filename: path.basename(attachmentPath),
                path: attachmentPath,
            },
        ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to", to);
}
/**
 * Create an Excel file and add data to it.
 * @param {string} fileName - Name of the Excel file to be created.
 * @param {string} sheetName - Name of the sheet inside the workbook.
 * @param {Array<Object>} data - Array of objects to write in the Excel sheet.
 */
function createExcelFile(fileName, sheetName, data) {
    // 1. Create a new workbook
    const workbook = XLSX.utils.book_new();

    // 2. Convert JSON data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 3. Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 4. Define file path
    const filePath = path.resolve(__dirname, fileName);

    // 5. Write the workbook to file
    XLSX.writeFile(workbook, filePath);

    console.log(`✅ Excel file created: ${filePath}`);
}





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
<p>${Week}</p>
    <p>This is a gentle reminder to submit your timesheet for the previous week. Timely submission helps in project tracking.</p>

    <p>Please click the button below to access the timesheet portal:</p>

    <a class="button" href="https://opensource.techcedence.net/lcp-trac-projects/#/" target="_blank">Submit Timesheet</a>

    <p>If you have already submitted your timesheet, kindly ignore this message.</p>

    <p>Thank you!<br>
    QA Team</p>

    
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
        await page.fill('//input[@type="email"]', 'venkatesha@techcedence.com');
        await page.fill('//input[@type="password"]', 'VenkatAvinash8*');
        await page.click("//button[text()=' submit ']");

    });

    test('Login with valid credentials and validate the homepage is loaded', async () => {
        await page.goto('https://opensource.techcedence.net/lcp-trac-projects/#/');

        await expect(page).toHaveTitle('Dashboard');

    });
    test('Get the user not submitted', async () => {
        await page.goto('https://opensource.techcedence.net/lcp-trac-projects/#/');
        await expect(page.locator("(//div[@class='ng-star-inserted']//div)[2]")).toBeVisible();
        const text = await page.locator("//body/app-root[1]/app-root[1]/div[1]/div[1]/div[2]/div[1]/div[1]/app-dashboard[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]").innerText();

        Week = text
        console.log(`Week: ${Week}`);


        //await expect(page).toHaveTitle('Timesheet');
        await expect(page.locator("//a[@data-entity='not_created_list']")).toBeVisible();
        await page.click("//a[@data-entity='not_created_list']");





        const table = await page.locator("table").innerText();
        let json = convertintoJson(table)

        // Extract values from "Name" column (2nd column)
        const nameColumnCells = await page.locator('table tbody tr td:nth-child(4)');
        const count = await nameColumnCells.count();

        for (let i = 0; i < count; i++) {
            const name = await nameColumnCells.nth(i).textContent();
            // console.log(`Name ${i + 1}:`, name?.trim());
            emailList.push(name)
        }
        //await sendEmails();
        // console.log(`Email List: ${emailList}`);
        createExcelFile('timesheet.xlsx', 'Submitted List', json);

        await sendEmailWithAttachment("venkatesha@techcedence.com", `Timesheet-  ${Week}`, "Below is the List of employee not submitted their timesheet.", path.resolve(__dirname, 'timesheet.xlsx'));
        emailList = emailList.filter(email => email.includes("@techcedence.com"));

        console.log(`Unsubmited List: ${emailList}`);
        await sendEmails();
        //console.log(`Emails sent to: ${emailList}`);
    });


    //   test('Profile link works', async () => {
    //     await page.click('nav >> text=Profile');
    //     await expect(page).toHaveURL(/.*\/profile/);
    //   });
});





// ✅ Step 2: Create reusable transporter (Gmail example)
