const { PrismaClient } = require("@prisma/client");
const { InferenceClient } = require("@huggingface/inference");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const {
  HFTransformersEmbeddings,
} = require("@langchain/community/embeddings/hf_transformers");
const { ChatHuggingFace } = require("@langchain/community/chat_models/hf");
const { RunnableSequence } = require("langchain/runnables");
const { formatDocumentsAsString } = require("langchain/util/document");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

const prisma = new PrismaClient();
const hfToken = process.env.HF_ACCESS_TOKEN;
const generationModel =
  process.env.HF_GENERATION_MODEL || "HuggingFaceH4/zephyr-7b-beta";
const embeddingModel =
  process.env.HF_EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2";

const hfClient = new InferenceClient(hfToken);
const llm = new ChatHuggingFace({
  inferenceClient: hfClient,
  model: generationModel,
  maxTokens: 256,
  temperature: 0.2,
});

const embedder = new HFTransformersEmbeddings({
  model: embeddingModel,
  accessToken: hfToken,
});

async function buildUserDocuments() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    pageContent: `User ${u.id}\nName: ${u.name || "N/A"}\nEmail: ${
      u.email
    }\nCreated: ${u.createdAt}`,
    metadata: { id: u.id, email: u.email },
  }));
}

module.exports = {
  async query(req, res, next) {
    try {
      const { question } = req.body;
      if (!question || question.trim().length === 0) {
        return res.status(400).json({ message: "question is required" });
      }

      if (!hfToken) {
        return res.status(500).json({
          message:
            "HF_ACCESS_TOKEN is missing. Set it in your environment to enable AI features.",
        });
      }

      const userDocs = await buildUserDocuments();
      if (!userDocs.length) {
        return res
          .status(404)
          .json({ message: "No user data available for retrieval." });
      }

      const vectorStore = await MemoryVectorStore.fromDocuments(
        userDocs,
        embedder
      );

      const retriever = vectorStore.asRetriever({ k: 3 });

      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are a helpful assistant that answers ONLY using the supplied context. If the context is insufficient, say you do not know.",
        ],
        [
          "user",
          "Context:\n{context}\n\nQuestion: {question}\nAnswer using only the context above.",
        ],
      ]);

      const chain = RunnableSequence.from([
        {
          context: async (input) => {
            const docs = await retriever.getRelevantDocuments(input.question);
            return formatDocumentsAsString(docs);
          },
          question: (input) => input.question,
        },
        prompt,
        llm,
      ]);

      const result = await chain.invoke({ question });

      return res.json({
        answer: result.content?.trim?.() || result.content || "",
        meta: {
          generationModel,
          embeddingModel,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
