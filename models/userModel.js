const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  nationality: {
    type: String,
  },
  nationalID: {
    type: String,
  },
  countryFlag: {
    type: String,
  },
},{
  timestamps: true,
  versionKey: false
});

const User = mongoose.model("users", userSchema);

module.exports = User;
