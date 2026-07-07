import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function init() {
    const result = await client.responses.create({
        model: "gpt-4.1-mini",
        input: "Hello, my name is Neel.",
    });
    console.log(result.output_text);
}

init();