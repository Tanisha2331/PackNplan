// index.js
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Use the standard library
require('dotenv').config(); // Optional: if you use .env files
// Add this to your backend/index.js
const corsOrigins = [
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5000"
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || corsOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy blocked origin: ${origin}`));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};


const app = express();
app.use(cors(corsOptions));

// Guard against stale CORS values from any historical mis-config.
app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && corsOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return next();
});

app.use(express.json());

// TO THIS:
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        // If API key is not configured, run a safe local fallback chatbot
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not found: using local fallback response');
            return res.json({ reply: `Agent: Sorry, AI backend is not configured.
Please set GEMINI_API_KEY in .env or use local development with a configured API key.` });
        }

        // ⚡ SPEED FIX: Use 'gemini-1.5-flash' (It is super fast)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;

        const replyText = response.text();
        if (!replyText) {
            console.warn('AI returned empty text, using fallback');
            return res.json({ reply: "Sorry, I got no response from AI, please try again." });
        }

        res.json({ reply: replyText });
    } catch (error) {
        console.error("AI Error:", error);
        // Prevent 500 from reaching client as a hard failure, return contextual fallback
        res.json({ reply: "I'm having trouble connecting to the travel database. Please try again in a moment." });
    }
});
// ===============================
// SERVER STARTUP
// ===============================
const PORT = process.env.PORT || 5000;

// Start server only if not being imported as a module
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Pack & Plan Backend Server`);
        console.log(`📍 Running on http://localhost:${PORT}`);
        console.log(`API Endpoints:`);
        console.log(`  POST /api/chat - AI Travel Assistant`);
        console.log(`\nFrontend connected from: ${corsOptions.origin}\n`);
    });
}

module.exports = app;