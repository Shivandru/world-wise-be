const jwt = require("jsonwebtoken");
function auth(req, res, next) {
  try {
    const { accessToken, refreshToken } = req.cookies;
    console.log(accessToken, refreshToken);
    console.log("req.cookies", req.cookies);
    next();
  } catch (error) {
    return {
      status: 500,
      json: {
        success: false,
        message: "unable to authenticate user",
      },
    };
  }
}
module.exports = auth;
