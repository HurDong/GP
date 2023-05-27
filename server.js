const express = require("express");
const openai = require("openai");
const bodyParser = require("body-parser");

openai.apiKey = "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"; // 실제 키로 바꾸세요.

const app = express();

app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const gptResponse = await openai.Completion.create({
      engine: "text-davinci-003",
      prompt: prompt,
      max_tokens: 100,
    });

    const message = gptResponse.choices[0].text.strip();
    res.json({ message: message });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while generating a message." });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
