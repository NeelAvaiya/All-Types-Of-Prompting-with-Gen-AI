import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({ apiKey });

async function main() {
    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: 
                `
                what is 3+5?
                Do not add anything else in ans, take the samples from the examples below and answer in the same format.
                Examples:
                - what is 2+2?
                Expected output: 4 (Four)
                - what is 10-3?
                Expected output: 7 (Seven)
                ` 
            }
        ],
    });
    console.log(response.choices[0].message.content);
}

main();