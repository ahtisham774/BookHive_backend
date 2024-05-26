const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status.send({ error: "Invalid token" });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (data) {
      req.user = data.userId;
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      status: "failure",
      statusCode: 401,
      error: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
