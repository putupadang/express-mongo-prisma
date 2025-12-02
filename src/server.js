const app = require("./app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log("Connected to MongoDB via Prisma");

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1);
  }
}

start();
