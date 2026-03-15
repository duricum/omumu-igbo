
require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Explicit route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Email transporter (Gmail) ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS   // App Password, NOT your real password
  }
});

// ── Booking endpoint ──
app.post('/api/book', async (req, res) => {
  const { name, email, phone, service, days, hoursPerDay, sessionsPerWeek, notes, timestamp } = req.body;

  // Format a readable email
  const emailBody = `
New Booking Request — Ọ̀mụmụ Igbo
=====================================

👤 Name:           ${name}
📧 Email:          ${email}
📞 Phone:          ${phone || 'Not provided'}

📚 Service:        ${service}
🗓  Preferred Days: ${days.join(', ')}
⏱  Hours/Day:      ${hoursPerDay}
📆 Sessions/Week:  ${sessionsPerWeek}

📝 Notes:
${notes || 'None'}

🕐 Submitted:      ${new Date(timestamp).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}
=====================================
Reply directly to this email to confirm the booking.
  `;

  try {
    // Email to YOU (the tutor)
    await transporter.sendMail({
      from:    `"Ọ̀mụmụ Igbo Platform" <${process.env.GMAIL_USER}>`,
      to:      'idriswale70@gmail.com',
      subject: `📚 New Booking: ${name} — ${service}`,
      text:    emailBody,
      replyTo: email
    });

    // Confirmation email to the STUDENT
    await transporter.sendMail({
      from:    `"Ọ̀mụmụ Igbo" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: `✅ Booking Received — We'll confirm within 24 hours`,
      text: `Nnọọ ${name}!\n\nThank you for booking with Ọ̀mụmụ Igbo.\n\nYour request for "${service}" has been received. We will confirm your schedule within 24 hours.\n\nService: ${service}\nDays: ${days.join(', ')}\nHours/Day: ${hoursPerDay}\nSessions/Week: ${sessionsPerWeek}\n\nIgbo kwenu! 🙌\nThe Ọ̀mụmụ Igbo Team`
    });

    res.json({ success: true, message: 'Booking received and emails sent.' });

  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
