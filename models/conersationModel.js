const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "system", "assistant", "tool"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    messages: {
      type: [messageSchema],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Conversation = mongoose.model("conversations", conversationSchema);

module.exports = Conversation;
