import nodemailer from 'nodemailer';

// ✅ Step 1: List of member emails
const emailList = [
  'praveenk@techcedence.com',
  
];

// ✅ Step 2: Create reusable transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sarathrajk@techcedence.com',
    pass: 'uxtnfjtjquycchfi'  // Use App Password, NOT your real password
  }
});

// ✅ Step 3: Loop through emails and send
async function sendEmails() {
  for (const recipient of emailList) {
    try {
      const info = await transporter.sendMail({
        from: '"Your Name" <your.email@gmail.com>',
        to: recipient,
        subject: 'Test Email',
        html: `<p>Hello ${recipient.split('@')[0]},<br>This is a test email.</p>`
      });
      console.log(`✅ Email sent to ${recipient}: ${info.response}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${recipient}:`, err.message);
    }
  }
}

sendEmails();
