import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function init() {
    const result = await client.messages.create({
        max_tokens: 1024,
        model: "claude-3.0",
        messages: [{role: "user", content: "Hello, claude!"}],
    }); 

    for(const block of result.content){
        if(block.type === "text"){
            console.log(block.text);
        }
    }
}

init();