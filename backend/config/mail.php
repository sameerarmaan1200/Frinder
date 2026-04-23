<?php
// ============================================================
// FRINDER — Mail Configuration
// File: backend/config/mail.php
//
// HOW TO GET A GMAIL APP PASSWORD:
// 1. Go to myaccount.google.com
// 2. Security → 2-Step Verification (must be ON)
// 3. Search "App passwords" → Create → select Mail
// 4. Copy the 16-character password
// 5. Paste it below (spaces are fine)
// ============================================================

define('SMTP_HOST',      'smtp.gmail.com');
define('SMTP_PORT',      587);
define('SMTP_SECURE',    'tls');                          // always tls for Gmail port 587
define('SMTP_USER',      'kabeermailkturkey2022@gmail.com'); // Your Gmail address
define('SMTP_PASS',      'txcp mhuh gmll tvsc');          // ← Your 16-char Gmail App Password
define('MAIL_FROM',      'kabeermailkturkey2022@gmail.com'); // Same as SMTP_USER for Gmail
define('MAIL_FROM_NAME', 'Frinder');
define('APP_NAME',       'Frinder');

