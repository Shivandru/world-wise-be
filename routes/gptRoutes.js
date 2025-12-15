const express = require("express");
const gptRouter = express.Router();
const GptFunctions = require("../functions/gptFunctions");
const gptFunctions = new GptFunctions();

gptRouter.post("/", async (req, res) => {
  console.log(req.body.message);
  try {
    const { status, json } = await gptFunctions.getShortSummary({
      message: req.body.message,
    });
    res.status(status).send(json);
  } catch (error) {
    res.status(500).send({ success: false, message: "something went wrong" });
  }
});

gptRouter.post("/full", async (req, res) => {
  try {
    const { status, json } = await gptFunctions.getFullSummary({
      message: req.body.message,
    });
    res.status(status).send(json);
  } catch (error) {
    res.status(500).send({ success: false, message: "something went wrong" });
  }
});

gptRouter.post("/chat", async (req, res) => {
  try {
    const { status, json } = await gptFunctions.chatbot({
      message: req.body.message,
      conversationId: req.body.conversationId ?? "",
    });
    res.status(status).send(json);
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "something went wrong" });
  }
});

module.exports = gptRouter;
