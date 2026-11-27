const dns = require("dns");

if (!process.env.VERCEL) {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
}


const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    throw new Error("MONGODB_URI must be configured in backend/.env or the deployment environment");
}

mongoose.connect(mongoUri)
    .then(function () {
        console.log("Connected to MongoDB Atlas");

        app.listen(process.env.PORT || 5000, function () {
            console.log("Server Started....");
        });
    })
    .catch(function (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exitCode = 1;
    });

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


app.post("/sendemail", async function (req, res) {
    try {
        console.log("Send email request received");

        const { msg, emailList } = req.body;

        if (!msg || !Array.isArray(emailList) || emailList.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message and email list are required"
            });
        }

        const data = await credential.findOne();

        console.log("Credentials found:", !!data);
        console.log("Gmail user:", data?.user);
        console.log("Password exists:", !!data?.pass);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Gmail credentials not found in database"
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

        for (let i = 0; i < emailList.length; i++) {
            await transporter.sendMail({
                from: data.user,
                to: emailList[i],
                subject: "A message from Kipss",
                text: msg
            });

            console.log("Email sent to:", emailList[i]);
        }

        return res.json({
            success: true,
            message: "All emails sent successfully"
        });

    } catch (error) {
        console.log("Email error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});