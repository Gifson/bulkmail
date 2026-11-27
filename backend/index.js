
const dns = require("dns");

if (!process.env.VERCEL) {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from environment variables");
}

let connectionPromise = null;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(mongoUri)
            .then(() => {
                console.log("Connected to MongoDB Atlas");
            })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    await connectionPromise;
}

// MongoDB credential model
const credentialSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    }
});

const credential = mongoose.model(
    "credential",
    credentialSchema,
    "bulkmail"
);

// Email sending route
app.post("/api/sendemail", async (req, res) => {
    try {
        console.log("Send email request received");

        // Connect to MongoDB before querying
        await connectDB();

        const { msg, emailList } = req.body;

        if (
            !msg ||
            typeof msg !== "string" ||
            !Array.isArray(emailList) ||
            emailList.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Message and email list are required"
            });
        }

        const data = await credential.findOne();

        console.log("Credentials found:", !!data);
        console.log("Gmail user:", data?.user);
        console.log("Password exists:", !!data?.pass);

        if (!data || !data.user || !data.pass) {
            return res.status(404).json({
                success: false,
                message: "Valid Gmail credentials not found"
            });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: data.user,
                pass: data.pass
            }
        });

        await transporter.verify();

        console.log("Gmail authentication successful");
        console.log("Sending emails...");

        let sentCount = 0;

        for (const email of emailList) {
            if (
                typeof email !== "string" ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ) {
                console.log("Skipping invalid email:", email);
                continue;
            }

            await transporter.sendMail({
                from: data.user,
                to: email.trim(),
                subject: "A message from Kipss",
                text: msg
            });

            sentCount++;
            console.log("Email sent to:", email);
        }

        return res.status(200).json({
            success: true,
            message: "Emails sent successfully",
            sentCount
        });

    } catch (error) {
        console.error("Email error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
});

// Local development only
if (!process.env.VERCEL) {
    connectDB()
        .then(() => {
            app.listen(process.env.PORT || 5000, () => {
                console.log("Server Started....");
            });
        })
        .catch((error) => {
            console.error("Database connection failed:", error);
        });
}

// Export Express app for Vercel
module.exports = app;
