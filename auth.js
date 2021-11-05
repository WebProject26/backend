const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["header-token"];
  // console.log("Verify started");
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, "RANDOM_TOKEN_HERE");
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;