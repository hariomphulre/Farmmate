const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

// ── Database Pool (uses pg driver — works reliably in Node.js) ──────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');
const JWT_SECRET = process.env.JWT_SECRET || 'farmmate_jwt_secret_2026';

// ── Nodemailer (optional — falls back to console logging if not configured) ──
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

// ── Helper: run a DB query safely ──
async function query(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rows;
    } finally {
        client.release();
    }
}

// ── Helper: generate JWT ──
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.user_type },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// ── Helper: send OTP email (or log to console) ──
async function sendOTPEmail(email, otp, purpose) {
    const subject = purpose === 'signup'
        ? 'Sign Up Verification Code'
        : 'Password Reset Code';

    const html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
            <h2 style="color:#052e16;margin-bottom:8px;">Farmmate</h2>
            <p style="color:#334155;">Your verification code is:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#fff;border-radius:8px;border:1px solid #e2e8f0;color:#052e16;">
                ${otp}
            </div>
            <p style="color:#64748b;font-size:13px;margin-top:16px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
    `;

    if (transporter) {
        await transporter.sendMail({
            from: `"Farmmate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
        });
        console.log(`[Email] OTP sent to ${email}`);
    } else {
        console.log(`\n========================================`);
        console.log(`  [OTP] ${purpose.toUpperCase()} code for ${email}: ${otp}`);
        console.log(`========================================\n`);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// DB INITIALIZATION — ensures tables exist on startup
// ══════════════════════════════════════════════════════════════════════════════
const initDB = async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS auth_users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255),
                user_type VARCHAR(50) NOT NULL,
                auth_provider VARCHAR(50) DEFAULT 'local',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await query(`
            CREATE TABLE IF NOT EXISTS otps (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(10) NOT NULL,
                purpose VARCHAR(20) NOT NULL DEFAULT 'signup',
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('[Auth] Database tables ready.');
    } catch (err) {
        console.error('[Auth] DB init error:', err.message);
    }
};
initDB();

// ══════════════════════════════════════════════════════════════════════════════
// 1. CHECK IF EMAIL EXISTS (used by frontend for live validation)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ exists: false });

        const rows = await query('SELECT id, auth_provider FROM auth_users WHERE email = $1', [email]);
        if (rows.length > 0) {
            return res.json({ exists: true, auth_provider: rows[0].auth_provider });
        }
        return res.json({ exists: false });
    } catch (err) {
        console.error('[check-email]', err.message);
        res.status(500).json({ exists: false, message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. SIGN UP — Step 1: Send 6-digit OTP
// ══════════════════════════════════════════════════════════════════════════════
router.post('/signup-init', async (req, res) => {
    try {
        const { email, name, user_type } = req.body;
        if (!email || !name || !user_type) {
            return res.status(400).json({ message: 'Name, email, and user type are required.' });
        }

        // Check if account already exists
        const existing = await query('SELECT id FROM auth_users WHERE email = $1', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Account already exists with this email.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires_at = new Date(Date.now() + 10 * 60 * 1000);

        // Clear old OTPs for this email
        await query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, 'signup']);

        // Insert new OTP
        await query(
            'INSERT INTO otps (email, otp, purpose, expires_at) VALUES ($1, $2, $3, $4)',
            [email, otp, 'signup', expires_at]
        );

        // Send OTP
        await sendOTPEmail(email, otp, 'signup');

        res.json({ message: 'OTP sent successfully.' });
    } catch (err) {
        console.error('[signup-init]', err.message);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. SIGN UP — Step 2: Verify OTP & Create Account
// ══════════════════════════════════════════════════════════════════════════════
router.post('/signup-verify', async (req, res) => {
    try {
        const { email, otp, name, password, user_type } = req.body;
        if (!email || !otp || !password || !name || !user_type) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate OTP
        const otpRows = await query(
            'SELECT * FROM otps WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1',
            [email, 'signup']
        );

        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        const otpRecord = otpRows[0];
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
        }
        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await query(
            'INSERT INTO auth_users (email, name, password_hash, user_type, auth_provider) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, user_type',
            [email, name, hash, user_type, 'local']
        );

        // Clean up OTPs
        await query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, 'signup']);

        const token = generateToken(newUser[0]);
        res.status(201).json({ message: 'Account created!', token, user: newUser[0] });
    } catch (err) {
        console.error('[signup-verify]', err.message);
        if (err.message?.includes('duplicate key')) {
            return res.status(409).json({ message: 'Account already exists with this email.' });
        }
        res.status(500).json({ message: 'Failed to create account. Please try again.' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. SIGN IN (Local)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/signin', async (req, res) => {
    try {
        const { email, password, user_type } = req.body;
        if (!email || !password || !user_type) {
            return res.status(400).json({ message: 'Email, password, and user type are required.' });
        }

        const rows = await query('SELECT * FROM auth_users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = rows[0];

        if (user.auth_provider === 'google') {
            return res.status(400).json({ message: 'This account uses Google sign-in. Please use "Continue with Google".' });
        }

        if (user.user_type !== user_type) {
            return res.status(400).json({ message: `This account is registered as "${user.user_type}". Please select the correct user type.` });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, user_type: user.user_type } });
    } catch (err) {
        console.error('[signin]', err.message);
        res.status(500).json({ message: 'Server error during sign in.' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. GOOGLE SIGN IN / SIGN UP
// ══════════════════════════════════════════════════════════════════════════════
router.post('/google', async (req, res) => {
    try {
        const { credential, user_type } = req.body;
        if (!credential || !user_type) {
            return res.status(400).json({ message: 'Missing Google token or user type.' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID || undefined,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let rows = await query('SELECT * FROM auth_users WHERE email = $1', [email]);

        if (rows.length === 0) {
            rows = await query(
                'INSERT INTO auth_users (email, name, user_type, auth_provider) VALUES ($1, $2, $3, $4) RETURNING id, email, name, user_type',
                [email, name, user_type, 'google']
            );
        } else {
            const user = rows[0];
            if (user.user_type !== user_type) {
                return res.status(400).json({
                    message: `This account is registered as "${user.user_type}". Please select the correct user type.`,
                });
            }
        }

        const token = generateToken(rows[0]);
        res.json({
            token,
            user: { id: rows[0].id, name: rows[0].name, email: rows[0].email, user_type: rows[0].user_type, picture },
        });
    } catch (err) {
        console.error('[google-auth]', err.message);
        res.status(500).json({ message: 'Google authentication failed. Please try again.' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. FORGOT PASSWORD — Step 1: Send 6-digit OTP
// ══════════════════════════════════════════════════════════════════════════════
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const rows = await query('SELECT id, auth_provider FROM auth_users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }
        if (rows[0].auth_provider === 'google') {
            return res.status(400).json({ message: 'This account uses Google sign-in. Password reset is not available.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires_at = new Date(Date.now() + 10 * 60 * 1000);

        await query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, 'reset']);
        await query(
            'INSERT INTO otps (email, otp, purpose, expires_at) VALUES ($1, $2, $3, $4)',
            [email, otp, 'reset', expires_at]
        );

        await sendOTPEmail(email, otp, 'reset');

        res.json({ message: 'Password reset code sent to your email.' });
    } catch (err) {
        console.error('[forgot-password]', err.message);
        res.status(500).json({ message: 'Failed to send reset code.' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. FORGOT PASSWORD — Step 2: Verify OTP & Reset Password
// ══════════════════════════════════════════════════════════════════════════════
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;
        if (!email || !otp || !new_password) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
        }

        const otpRows = await query(
            'SELECT * FROM otps WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1',
            [email, 'reset']
        );
        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'No reset code found. Please request a new one.' });
        }
        if (otpRows[0].otp !== otp) {
            return res.status(400).json({ message: 'Invalid code.' });
        }
        if (new Date(otpRows[0].expires_at) < new Date()) {
            return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
        }

        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(new_password, salt);

        await query('UPDATE auth_users SET password_hash = $1 WHERE email = $2', [hash, email]);
        await query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, 'reset']);

        res.json({ message: 'Password reset successfully! You can now sign in.' });
    } catch (err) {
        console.error('[reset-password]', err.message);
        res.status(500).json({ message: 'Failed to reset password.' });
    }
});

module.exports = router;
