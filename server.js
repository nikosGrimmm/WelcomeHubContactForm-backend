import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,    
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

app.post("/api/send-email", async (req, res) => {
    try{
        const {room, category, email, message} = req.body;

        if(!room || !category || !email || !message){
            return res.status(400).json({error: "Missing required field"});
        }

        const subject = `WelcomeHub: New message from Room ${room} - Category: ${category}`;

        const body = `You have received a new message from WelcomeHub.\n`
            + `Room: ${room}\n`
            + `Category: ${category}\n`
            + `Email: ${email}\n\n`
            + `Message:\n${message}`;

            await transporter.sendMail({
                from: process.env.DEFAULT_FROM,
                to: email,
                subject: subject,
                text: body
            });

            res.status(200).json({message: "Email sent successfully"});
    }catch(error){
        console.error("Error sending email:", error);
        return res.status(500).json({error: "Internal Server Error"});
    }

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});