const express = require("express");
const openai = require("openai");
const dotenv = require("dotenv");

dotenv.config();

openai.apiKey = process.env.OPENAI_API_KEY;

const app = express();

app.get("/generate-text", async (req, res) => {
  const prompt = req.query.prompt;
  try {
    const gptResponse = await openai.Completion.create({
      engine: "text-davinci-002",
      prompt: prompt,
      max_tokens: 100,
    });

    return res.json({
      generated_text: gptResponse.choices[0].text,
    });
  } catch (err) {
    return res.json({
      error: "An error occurred while generating a message.",
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
