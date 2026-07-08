import dotenv from "dotenv";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const RisksSchema = z.object({
    title: z.string().describe('the actual title for risk'),
    risks: z.array(z.string().describe('3-4 tags for the risk')),
    score: z.number().min(1).max(5).describe('risk level out of 5'),
});

const outputSchema = z.object({
    risks: z.array(RisksSchema).describe('array of risks.'),
});

async function init() {
    const result = await client.responses.create({
        model: "gpt-4.1-mini",
        text: {
            format: zodTextFormat(outputSchema, "risks"),
        },
        input: `Extract the risks from the following document
        
        Document: "The project is behind schedule due to unexpected technical challenges. There is a risk of budget overruns if additional resources are required. Additionally, there is a potential for team burnout if the workload continues to increase without proper support. and there is a risk of data security breaches if sensitive information is not handled properly. and there is a risk of miscommunication among team members leading to errors and delays. and there is a risk of regulatory non-compliance if the project does not adhere to industry standards. and there is a risk of stakeholder dissatisfaction if the project does not meet expectations. and there is a risk of vendor dependency if critical components are sourced from a single supplier. and there is a risk of technology obsolescence if the chosen solutions become outdated quickly. and there is a risk of market changes affecting the project's relevance and success." 

        Please list any risks you find in the document above.
        `,
    });
    console.log(result.output_text);
}

init();