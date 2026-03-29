import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ reply: "Method not allowed" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const { prompt } = req.body;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return res.status(200).json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error);
        return res.status(500).json({ reply: "AI not working, try again." });
    }
}