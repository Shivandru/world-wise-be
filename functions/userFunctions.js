const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = Number(process.env.SALT_ROUNDS);
const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
class UserFunctions {
  async createUser({ fullName, email, password }) {
    try {
      if (!fullName || !email || !password) {
        return {
          status: 400,
          json: {
            success: false,
            message: "missing required fields",
          },
        };
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          status: 400,
          json: {
            success: false,
            message: "user already exists",
          },
        };
      }
      const hash = await bcrypt.hash(password, saltRounds);
      const user = await User.create({
        fullName,
        email,
        password: hash,
      });

      return {
        status: 200,
        json: {
          success: true,
          user,
        },
      };
    } catch (error) {
      console.log("error", error);
      return {
        status: 500,
        json: {
          success: false,
          message: "something went wrong",
        },
      };
    }
  }

  async loginUser({ email, password }) {
    try {
      if (!email || !password) {
        return {
          status: 400,
          json: {
            success: false,
            message: "missing required fields",
          },
        };
      }
      const user = await User.findOne({ email });
      if (!user) {
        return {
          status: 400,
          json: {
            success: false,
            message: "user does not exist",
          },
        };
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          status: 400,
          json: {
            success: false,
            message: "invalid credentials",
          },
        };
      }
      const access_token = jwt.sign(
        { email: user.email, userId: user._id },
        accessTokenKey,
        { expiresIn: 40*60 }
      );
      const refresh_token = jwt.sign(
        { email: user.email, userId: user._id },
        refreshTokenKey,
        { expiresIn: 60*60 }
      );

      return {
        status: 200,
        json: {
          success: true,
          user,
          access_token,
          refresh_token,
        },
      };
    } catch (error) {
      return {
        status: 500,
        json: {
          success: false,
          message: "something went wrong",
        },
      };
    }
  }
}

module.exports = UserFunctions;
