const express = require("express");
const userRouter = express.Router();
const UserFunctions = require("../functions/userFunctions");
const userFunction = new UserFunctions();

userRouter.post("/create", async (req, res) => {
  try {
    const { status, json } = await userFunction.createUser({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    });
    res.status(status).send(json);
  } catch (error) {
    return {
      status: 500,
      json: {
        success: false,
        message: "something went wrong",
      },
    };
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const { status, json } = await userFunction.loginUser({
      email: req.body.email,
      password: req.body.password,
    });
    res.cookie("accessToken", json.access_token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.cookie("refreshToken", json.refresh_token, {
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      // sameSite: "none",
      // secure: true,
    });
    res.status(status).send({
      success: true,
      user: json.user,
    });
  } catch (error) {
    return {
      status: 500,
      json: {
        success: false,
        message: "something went wrong",
      },
    };
  }
});
module.exports = userRouter;
