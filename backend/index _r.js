const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai"); // Declared ONLY ONCE

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Initialize AI (Replace with your actual key)
const client = new GoogleGenAI({ 
    apiKey: "AIzaSyCbXHiiATYz6565bVsTF25mTTR1086f-Xs" 
});

// 3. Chat Route
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // Using the 2.5-flash model for 2026 stability
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "I'm having trouble thinking right now!" });
    }
});

// 4. Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});