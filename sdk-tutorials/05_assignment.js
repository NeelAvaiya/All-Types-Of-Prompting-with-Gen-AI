import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const HEALTH_PROMPT = `
You are a health assistant.

For every user question, always follow this exact structure.

DECODE:
- Explain what the user is asking.

EXTRACT:
- Extract Height, Weight, Age, Gender.
- If any information is missing, write "Not Provided".

ANSWER:
- Answer in exactly 3 sentences.
- If height and weight are available, estimate an ideal weight range.
- Mention a healthy body fat percentage range if appropriate.
- Give practical health tips.
- Do not diagnose diseases or provide dangerous medical advice.
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT-4o
async function getGPT4oResponse(question) {
  const response = await openai.responses.create({
    model: "gpt-4o",
    instructions: HEALTH_PROMPT,
    input: question,
  });

  return response.output_text;
}

// GPT-4o-mini
async function getGPT4oMiniResponse(question) {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions: HEALTH_PROMPT,
    input: question,
  });

  return response.output_text;
}

// Judge using GPT-4o
async function judgeResponses(question, answer4o, answerMini) {
  const prompt = `
You are an expert AI evaluator.

Compare these two responses.

User Question:
${question}

-----------------------------------

GPT-4o Answer:

${answer4o}

-----------------------------------

GPT-4o-mini Answer:

${answerMini}

-----------------------------------

Evaluate based on:

1. Accuracy
2. Completeness
3. Following Instructions
4. Clarity
5. Helpfulness

Return ONLY valid JSON.

{
  "winner":"GPT-4o" or "GPT-4o-mini",
  "reason":"Why this answer is better",
  "bestAnswer":"Paste the complete winning answer"
}
`;

  const response = await openai.responses.create({
    model: "gpt-4o",
    input: prompt,
  });

  let output = response.output_text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(output);
}

async function main() {
  try {
    const question =
      `I am 5'4" and weigh 67 kg. What is my ideal weight and how can I reduce body fat?`;

    console.log("Question:");
    console.log(question);

    console.log("\nGenerating responses...\n");

    const [gpt4oAnswer, gpt4oMiniAnswer] = await Promise.all([
      getGPT4oResponse(question),
      getGPT4oMiniResponse(question),
    ]);

    console.log("========================================");
    console.log("GPT-4o");
    console.log("========================================\n");
    console.log(gpt4oAnswer);

    console.log("\n========================================");
    console.log("GPT-4o-mini");
    console.log("========================================\n");
    console.log(gpt4oMiniAnswer);

    console.log("\nEvaluating...\n");

    const result = await judgeResponses(
      question,
      gpt4oAnswer,
      gpt4oMiniAnswer
    );

    console.log("========================================");
    console.log("FINAL RESULT");
    console.log("========================================");

    console.log("Winner :", result.winner);
    console.log("Reason :", result.reason);

    console.log("\n========================================");
    console.log("BEST ANSWER");
    console.log("========================================\n");

    console.log(result.bestAnswer);

  } catch (err) {
    console.error(err);
  }
}

main();