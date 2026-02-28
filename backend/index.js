// index.js
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Use the standard library
require('dotenv').config(); // Optional: if you use .env files
// Add this to your backend/index.js
const corsOptions = {
    origin: "https://packnplan.vercel.app", // Your ACTUAL frontend URL from the error
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};


const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// ⚠️ PASTE YOUR API KEY HERE
const genAI = new GoogleGenerativeAI("AIzaSyCbXHiiATYz6565bVsTF25mTTR1086f-Xs");

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // ⚡ SPEED FIX: Use 'gemini-1.5-flash' (It is super fast)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ reply: response.text() });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "I'm having trouble connecting to the travel database." });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server speeding on http://localhost:${PORT}`));