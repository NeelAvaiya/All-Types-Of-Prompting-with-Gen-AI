import OpenAI from "openai";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({ apiKey });

async function executeCommandOnCli(cmd) {
    return new Promise((res) => {
        exec(cmd, (err, out) => {
            if (err) return res(String(err));
            return res(out.trim());
        });
    });
}

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
 - If the task requires creating files, folders, or running shell commands, return a JSON object with step "TOOL_REQUEST", functionName "executeCommandOnCli", and input as the shell command.
 - When creating files, do not just run mkdir or touch. Write the full file contents in the shell command using here-doc syntax.
 - For HTML/CSS projects, create real files like index.html and styles.css with complete content inside the command.
 - Always return valid JSON.

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
        const cleanedResult = String(rawResult || "")
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();
        const parsedResult = JSON.parse(cleanedResult);

        MESSAGE_DB.push({role: "assistant", content: rawResult});

        if (parsedResult.step.toLowerCase() === "tool_request") {
            const { functionName, input } = parsedResult;

            if (functionName === "executeCommandOnCli") {
                const result = await executeCommandOnCli(input);
                console.log(`🛠️: TOOL_RESPONSE: ${result}`);
                MESSAGE_DB.push({role: "developer", content: JSON.stringify({ step: "TOOL_OUTPUT", output: result })});
                continue;
            }
        }

        console.log(`🤖: ${parsedResult.step}: ${parsedResult.text}`);

        if (parsedResult.step.toLowerCase() === "output") {
            break;
        }
    }
}

main('make todo app in html, css and in folder agent name with beautiful webpage and run on browser.');