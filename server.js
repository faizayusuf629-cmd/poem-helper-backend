import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json({ limit: "50kb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Poem Helper AI backend is running!");
});

app.post("/api/ai", async (req, res) => {
  try {
    const { task, topic, poem, mood, length } = req.body;

    const allowedTasks = ["analyze", "poem", "story"];

    if (!allowedTasks.includes(task)) {
      return res.status(400).json({
        error: "Choose analyze, poem, or story."
      });
    }

    if (typeof topic !== "string" || topic.length > 500) {
      return res.status(400).json({
        error: "Please enter a valid topic."
      });
    }

    if (task === "analyze" &&
        (typeof poem !== "string" || !poem.trim() || poem.length > 12000)) {
      return res.status(400).json({
        error: "Enter a poem of up to 12,000 characters."
      });
    }

    const instructions = {
      analyze: `Analyze the supplied poem deeply. Explain its literal meaning, stanza-by-stanza meaning, themes, emotions, imagery, symbolism, literary devices, possible hidden meanings, and overall message. Support interpretations with details from the poem. Acknowledge ambiguity instead of inventing certainty.\n\nPoem:\n${poem}`,
      poem: `Write an original poem about: ${topic}. Mood: ${mood || "thoughtful"}. Length: ${length || "medium"}. Make it specific to the topic, imaginative, coherent, and meaningfully different from generic poems.`,
      story: `Write an original, engaging story about: ${topic}. Mood: ${mood || "adventurous"}. Length: ${length || "medium"}. Include a setting, memorable characters, a clear plot, and a satisfying ending.`
    };

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: "You are Poem Helper, a thoughtful poetry analyst, creative poet, and storyteller. Use clear, accessible English.",
      input: instructions[task]
    });

    res.json({ result: response.output_text });
  } catch (error) {
    console.error("AI request failed:", error.message);
    res.status(500).json({
      error: "The AI request failed. Check the backend configuration and API account."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Poem Helper backend listening on port ${port}`);
});
