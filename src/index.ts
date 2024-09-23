import express from 'express';
import rateLimit from 'express-rate-limit'

const app = express();
const PORT = 3000;

app.use(express.json());

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 3 OTP requests per windowMs
    message: 'Too many requests, please try again after 5 minutes',
    standardHeaders: true, // Return rate limit info in the 'RateLimit- headers
    legacyHeaders: false // Disable the X-RateLimit- headers
});
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 password reset requests per windowMs
    message: 'Too many password reset attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Store OTPs in a simple in-memory object
const otpStore: Record<string, string> = {};

// Endpoint to generate and log OTP
app.post('/generate-otp', otpLimiter, (req, res) =>{
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const otp = Math.floor(100000+ Math.random() * 900000).toString(); // generates a 6-digit OTP

    otpStore[email] = otp;
    console.log(`OTP for ${email} : ${otp}`);
    res.status(200).json({message: "OTP generated and logged"});
});

app.post('/reset-Password', passwordResetLimiter, (req, res) =>{
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, otp and newpassowrd is required" });
    }

    if(otpStore[email] === otp){
        console.log(`Password for ${email} has been reset successfully`);
        delete otpStore[email];
        res.status(200).json({Message: "Password has been reset successfully"});
    }
    else{
        res.status(401).json({Message: "Invalid OTP"});
    }
});

app.listen(PORT, ()=>{
    console.log(`server running on port http://localhost:${PORT}`);
})