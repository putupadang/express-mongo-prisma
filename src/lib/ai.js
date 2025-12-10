const { InferenceClient } = require("@huggingface/inference");

const hfAccessToken = process.env.HF_ACCESS_TOKEN;
const generationModel =
  process.env.HF_GENERATION_MODEL || "HuggingFaceH4/zephyr-7b-beta";
const embeddingModel =
  process.env.HF_EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2";

if (!hfAccessToken) {
  console.warn(
    "[ai] HF_ACCESS_TOKEN is not set. Set it in your environment to enable AI features."
  );
}

const client = new InferenceClient(hfAccessToken);

async function embedText(text) {
  const result = await client.featureExtraction({
    model: embeddingModel,
    inputs: text,
  });

  // featureExtraction returns an array of arrays; flatten to 1D vector
  return Array.isArray(result[0]) ? result[0] : result;
}

async function generateAnswer(question, context) {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that answers ONLY using the supplied context. If the context is insufficient, say you do not know.",
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${question}\nAnswer using only the context above.`,
    },
  ];

  const response = await client.chatCompletion({
    model: generationModel,
    messages,
    max_tokens: 256,
    temperature: 0.2,
  });

  const content = response?.choices?.[0]?.message?.content;
  return content ? content.trim() : "";
}

module.exports = {
  embedText,
  generateAnswer,
  generationModel,
  embeddingModel,
};
