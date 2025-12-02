module.exports = (err, req, res, next) => {
  console.error(err);
  if (err && err.code === "P2002") {
    return res
      .status(409)
      .json({ message: "Unique constraint failed", meta: err.meta });
  }
  res.status(500).json({ message: "Internal Server Error" });
};
