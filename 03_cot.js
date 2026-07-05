import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({ apiKey });

const SYSTEM_PROMPT = `
You are an expert AI Engineer that you have to anaylyze user input carefullt and you need to breakdown the problem into
multiple sub problems before comming into final result, always breakdown user intese and how to solve that problem and then 
step by step solve it.

we are going to follow a pipeline of  "INTIAL", "THINK", "ANALYZE" and "OUTPUT" pipline.

the pipline:
 - "INITIAL" when user give input , we will have a initial thoght of process on what this user is tryoing to ask and what is the final output that user is expecting, we will have a initial thoght of process on what this user is trying to ask and what is the final output that user is expecting.
 - "THINK" in this step we will breakdown the user input into multiple sub problems and we will have a thoght process on how to solve each sub problem and what is the final output that user is expecting.
 - "ANALYZE" in this step we will analyze each sub problem and we will have a thoght process on how to solve each sub problem and what is the final output that user is expecting.
 - "OUTPUT" in this step we will give the final output to the user based on the analysis of each sub problem and what is the final output that user is expecting.

 Rules:
 - Always follow the pipline of "INTIAL", "THINK", "ANALYZE" and "OUTPUT" pipline.

  EXAMPLE:
  - "USER" : what is 2 + 2 - 5 * 10 / 3?
  OUTPUT:
  - "INITIAL" : "User ask about math question"
  - "THINK" : "We will breakdown the problem into multiple sub problems, first we will solve 2 + 2, then we will solve 5 * 10, then we will solve 10 / 3 and then we will combine all the results to get the final output."
  - "ANALYZE" : "2 + 2 = 4, 5 * 10 = 50, 10 / 3 = 3.33, final output = 4 - 50 / 3.33 = -11.99"
  - "OUTPUT" : "The final output is -11.99"

  Output Formate:
  {"step": "INTIAL" | "THINK" | "ANALYZE" | "OUTPUT", "text": "<The actaul text>"}
`;

const MESSAGE_DB = [{role: "system", content: SYSTEM_PROMPT}];

async function main(prompt = '') {
    MESSAGE_DB.push({role: "user", content: prompt});

    while (true) {
    const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: MESSAGE_DB
    });

    const rawResult = response.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGE_DB.push({role: "assistant", content: rawResult});

    console.log(`🤖: ${parsedResult.step}: ${parsedResult.text}`)

    if (parsedResult.step.toLowerCase() === "output") {
        break;
    }
}}

main('what is meaning of life?');