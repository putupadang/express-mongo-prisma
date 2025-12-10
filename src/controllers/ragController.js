const { PrismaClient } = require("@prisma/client");
const {
  embedText,
  generateAnswer,
  embeddingModel,
  generationModel,
} = require("../lib/ai");

const prisma = new PrismaClient();

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return -1;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? -1 : dot / denom;
}

async function buildUserContext() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  const docs = users.map((u) => ({
    id: u.id,
    text: `User ${u.id}\nName: ${u.name || "N/A"}\nEmail: ${
      u.email
    }\nCreated: ${u.createdAt}`,
  }));

  const vectors = [];
  for (const doc of docs) {
    // eslint-disable-next-line no-await-in-loop
    const embedding = await embedText(doc.text);
    vectors.push({ ...doc, embedding });
  }

  return vectors;
}

module.exports = {
  async query(req, res, next) {
    try {
      const { question } = req.body;
      if (!question || question.trim().length === 0) {
        return res.status(400).json({ message: "question is required" });
      }

      if (!process.env.HF_ACCESS_TOKEN) {
        return res.status(500).json({
          message:
            "HF_ACCESS_TOKEN is missing. Set it in your environment to enable AI features.",
        });
      }

      const docs = await buildUserContext();
      if (!docs.length) {
        return res
          .status(404)
          .json({ message: "No user data available for retrieval." });
      }

      const questionEmbedding = await embedText(question);

      const ranked = docs
        .map((doc) => ({
          ...doc,
          score: cosineSimilarity(questionEmbedding, doc.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const context = ranked
        .map(
          (r, idx) => `#${idx + 1} (score ${r.score.toFixed(3)}):\n${r.text}`
        )
        .join("\n\n");

      const answer = await generateAnswer(question, context);

      return res.json({
        answer,
        context,
        meta: {
          generationModel,
          embeddingModel,
          hits: ranked.map(({ id, score }) => ({ id, score })),
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
