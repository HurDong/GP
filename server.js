const express = require("express");
const openai = require("openai-official");
require("dotenv").config();

const app = express();
const api = new openai.OpenAiGpt3({ apiKey: process.env.OPENAI_API_KEY });

app.get("/generate-text", async (req, res) => {
  const prompt = req.query.prompt;
  try {
    const gptResponse = await api.complete({
      engine: "text-davinci-002",
      prompt: prompt,
      max_tokens: 60,
    });
    res.json({ generatedText: gptResponse.choices[0].text });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while generating a message." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
