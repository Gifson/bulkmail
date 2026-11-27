
import axios from "axios";
import { useState } from "react";
import * as XLSX from "xlsx";

function App() {

    const [msg, setmsg] = useState("");
    const [status, setstatus] = useState(false);
    const [emailList, setEmailList] = useState([]);
    const [result, setResult] = useState("");

    // Handle message input
    function handlemsg(evt) {
        setmsg(evt.target.value);
    }

    // Handle Excel file upload
    function handlefile(event) {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        const allowedExtensions = /\.(xlsx|xls|csv)$/i;

        if (!allowedExtensions.test(file.name)) {
            alert("Please upload an Excel or CSV file");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            try {
                const data = event.target.result;

                const workbook = XLSX.read(data, {
                    type: "array"
                });

                const sheetName = workbook.SheetNames[0];

                const worksheet = workbook.Sheets[sheetName];

                const rows = XLSX.utils.sheet_to_json(
                    worksheet,
                    { header: 1 }
                );

                // Extract valid email addresses from first column
                const emails = rows
                    .map(row => row[0])
                    .filter(value => typeof value === "string")
                    .map(value => value.trim())
                    .filter(value =>
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    );

                // Remove duplicate email addresses
                const uniqueEmails = [...new Set(
                    emails.map(email => email.toLowerCase())
                )];

                setEmailList(uniqueEmails);
                setResult("");

                console.log("Email list:", uniqueEmails);

                if (uniqueEmails.length === 0) {
                    alert("No valid email addresses found in the first column");
                }

            } catch (error) {
                console.log("Excel error:", error);
                alert("Unable to read the uploaded file");
            }
        };

        reader.onerror = function () {
            alert("Error reading the file");
        };

        reader.readAsArrayBuffer(file);
    }

    // Send emails
    async function send() {

        if (!msg.trim()) {
            alert("Please enter an email message");
            return;
        }

        if (emailList.length === 0) {
            alert("Please upload an Excel file containing email addresses");
            return;
        }

        setstatus(true);
        setResult("");

        try {

            const response = await axios.post(
                "/api/sendemail",
                {
                    msg: msg,
                    emailList: emailList
                },
                {
                    timeout: 300000
                }
            );

            const data = response.data;

            if (data.success) {

                setResult(
                    `Success! ${data.sent} emails sent successfully.`
                );

                alert(
                    `${data.sent} emails sent successfully!`
                );

            } else {

                setResult(
                    `Completed: ${data.sent} sent, ${data.failed} failed.`
                );

                alert(
                    `Sending completed.\nSent: ${data.sent}\nFailed: ${data.failed}`
                );
            }

            console.log("Backend response:", data);

        } catch (error) {

            console.error("Email sending error:", error);

            let errorMessage = "Unable to send emails";

            if (error.response) {
                errorMessage =
                    error.response.data.message || errorMessage;
            } else if (error.code === "ECONNABORTED") {
                errorMessage = "Request timed out. Please check the backend.";
            } else if (error.request) {
                errorMessage = "Backend is not responding. Check your server.";
            }

            setResult("Error: " + errorMessage);
            alert(errorMessage);

        } finally {
            setstatus(false);
        }
    }

    return (
        <div>

            <div className="bg-blue-950 text-white text-center">
                <h1 className="text-2xl font-medium px-5 py-3">
                    BulkMail
                </h1>
            </div>

            <div className="bg-blue-800 text-white text-center">
                <h1 className="font-medium px-5 py-3">
                    We can help your business with sending multiple emails at once
                </h1>
            </div>

            <div className="bg-blue-600 text-white text-center">
                <h1 className="font-medium px-5 py-3">
                    Drag and Drop
                </h1>
            </div>

            <div className="bg-blue-400 flex flex-col items-center text-black px-5 py-8">

                <textarea
                    onChange={handlemsg}
                    value={msg}
                    className="w-[80%] h-32 py-2 outline-none px-2 border border-black rounded-md"
                    placeholder="Enter the email text..."
                />

                <div>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handlefile}
                        className="border-4 border-dashed py-4 px-4 mt-5 mb-5"
                    />
                </div>

                <p className="font-medium">
                    Total emails in the file: {emailList.length}
                </p>

                <button
                    onClick={send}
                    disabled={status}
                    className="bg-blue-950 mt-4 py-2 px-5 text-white font-medium rounded-md w-fit disabled:opacity-50"
                >
                    {status ? "Sending..." : "Send"}
                </button>

                {result && (
                    <p className="mt-4 font-medium">
                        {result}
                    </p>
                )}

            </div>

            <div className="bg-blue-300 text-white text-center p-8">
                <h1 className="font-medium px-5 py-3">
                    BulkMail - Send Emails Easily
                </h1>
            </div>

            <div className="bg-blue-200 text-white text-center p-8">
                <h1 className="font-medium px-5 py-3">
                    Thank You
                </h1>
            </div>

        </div>
    );
}

export default App;
