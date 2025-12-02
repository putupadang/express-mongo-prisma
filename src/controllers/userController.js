const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  async list(req, res, next) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(users);
    } catch (e) {
      next(e);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ message: "Not found" });
      res.json(user);
    } catch (e) {
      next(e);
    }
  },

  async create(req, res, next) {
    try {
      const { email, name } = req.body;
      const user = await prisma.user.create({ data: { email, name } });
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { email, name } = req.body;
      const user = await prisma.user.update({
        where: { id },
        data: { email, name },
      });
      res.json(user);
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      await prisma.user.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};
