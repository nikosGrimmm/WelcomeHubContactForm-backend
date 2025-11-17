import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());


app.post("/api/send-email", async (req, res) => {
    try{
        const {room, category, email, message} = req.body;

        if(!room || !category || !email || !message){
            return res.status(400).json({error: "Missing required field"});
        }

        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.DEFAULT_FROM;

        if(!apiKey || !from){
            console.error("Missing API key or default from address in env");
            return res.status(500).json({error: "Server configuration error"});
        }

        const subject = `WelcomeHub: New message from Room ${room} - Category: ${category}`;

        const body = `You have received a new message from WelcomeHub.\n`
            + `Room: ${room}\n`
            + `Category: ${category}\n`
            + `Email: ${email}\n\n`
            + `Message:\n${message}`;

            const response = await fecth("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: from,
                    to: email,
                    subject: subject,
                    text: body
                })
            });

            if(!response.ok){
                console.error("Failed to send email via Resend:", await response.text());
                return res.status(502).json({error: "Failed to send email"});
            }

            res.status(200).json({message: "Email sent successfully"});
    }catch(error){
        console.error("Error sending email:", error);
        return res.status(500).json({error: "Internal Server Error"});
    }

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});