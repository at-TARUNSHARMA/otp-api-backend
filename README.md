# Express Rate Limiting for OTP and Password Reset

This project is an Express-based API that includes rate limiting to prevent abuse of OTP generation and password reset functionalities. It uses the `express-rate-limit` middleware to limit the number of requests per IP address.

## Features

- **Rate limiting**: Limits OTP generation requests to 3 per 5 minutes and password reset requests to 5 per 15 minutes.
- **OTP Generation**: Generates a 6-digit OTP and logs it to the console for demonstration purposes.
- **Password Reset**: Verifies OTP and resets the password.

## Prerequisites

- Node.js and npm installed

## Setup

1. Clone the repository:

   bash
   git clone https://github.com/your-repo/project.git
   

2. Install dependencies:

   bash
   npm install
   

3. Run the server:

   bash
   npm start
   

   The server will run on `http://localhost:3000`.

## Code Explanation

### Importing Dependencies

The project uses `express` for building the API and `express-rate-limit` for rate limiting.

javascript
import express from 'express';
import rateLimit from 'express-rate-limit';


### Creating the Express App

javascript
const app = express();
const PORT = 3000;

app.use(express.json());


### Rate Limiting Middleware

#### OTP Rate Limiting

Limits OTP generation requests to 3 per 5 minutes from a single IP address. If the limit is exceeded, a message is returned asking the user to try again after 5 minutes.

javascript
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 3 OTP requests per windowMs
    message: 'Too many requests, please try again after 5 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});


#### Password Reset Rate Limiting

Limits password reset requests to 5 per 15 minutes from a single IP address.

javascript
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 password reset requests per windowMs
    message: 'Too many password reset attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});


### Storing OTPs

OTPs are stored in a simple in-memory object. This is for demonstration purposes and should not be used in production. You can replace this with a database for persistent storage.

javascript
const otpStore: Record<string, string> = {};


### API Endpoints

#### 1. Generate OTP (`/generate-otp`)

This endpoint generates a 6-digit OTP for a given email and logs it to the console.

- **Rate Limiting**: 3 requests per 5 minutes
- **Request**: Requires an email in the request body.
- **Response**: Logs the OTP to the console and returns a message indicating that the OTP has been generated.

javascript
app.post('/generate-otp', otpLimiter, (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generates a 6-digit OTP

    otpStore[email] = otp;
    console.log(`OTP for ${email}: ${otp}`);
    res.status(200).json({ message: "OTP generated and logged" });
});


#### 2. Reset Password (`/reset-Password`)

This endpoint verifies the OTP and resets the password if the OTP is valid.

- **Rate Limiting**: 5 requests per 15 minutes
- **Request**: Requires `email`, `otp`, and `newPassword` in the request body.
- **Response**: If the OTP is correct, it resets the password and returns a success message.

javascript
app.post('/reset-Password', passwordResetLimiter, (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (otpStore[email] === otp) {
        console.log(`Password for ${email} has been reset successfully`);
        delete otpStore[email];
        res.status(200).json({ message: "Password has been reset successfully" });
    } else {
        res.status(401).json({ message: "Invalid OTP" });
    }
});


### Running the Server

The server runs on `http://localhost:3000`. When the server starts, you should see the message:

bash
server running on port http://localhost:3000


### Example Requests

1. **Generate OTP**

   bash
   POST http://localhost:3000/generate-otp
   Content-Type: application/json

   {
       "email": "user@example.com"
   }
   

2. **Reset Password**

   bash
   POST http://localhost:3000/reset-Password
   Content-Type: application/json

   {
       "email": "user@example.com",
       "otp": "123456",
       "newPassword": "newpassword123"
   }
   

## Dependencies

- **express**: A minimal and flexible Node.js web application framework.
- **express-rate-limit**: A rate-limiting middleware for Express to prevent abuse of routes.

Install the dependencies using npm:

bash
npm install express express-rate-limit


## License

This project is licensed under the MIT License.


This `README.md` provides an overview of the project, explains the functionality of the code, and includes instructions for running the server and making requests. You can customize it further to fit your needs.
