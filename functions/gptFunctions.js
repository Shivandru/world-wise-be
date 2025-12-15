const cheerio = require("cheerio");
const axios = require("axios");
const Conversation = require("../models/conersationModel");
const OpenAI = require("openai");

class GptFunctions {
  static openai = new OpenAI({
    baseURL: "http://localhost:11434/v1",
    apiKey: "ollama",
  });
  static MODEL = "llama3.2";

  async getWebsiteDetails(url) {
    try {
      const websiteBody = await axios.get(url);
      const $ = cheerio.load(websiteBody.data);
      $("script, style, img, input, noscript, iframe").remove();
      const cleanText = $("body").text();
      const finalText = cleanText.replace(/\s+/g, " ").trim();
      return finalText;
    } catch (error) {
      console.log("error", error);
    }
  }
  async getShortSummary({ message }) {
    try {
      if (!message) {
        return {
          status: 400,
          json: {
            success: false,
            message: "message is required",
          },
        };
      }
      const websiteBody = await axios.get(message);
      const $ = cheerio.load(websiteBody.data);
      $("script, style, img, input, noscript, iframe").remove();
      const cleanText = $("body").text();
      const finalText = cleanText.replace(/\s+/g, " ").trim();
      console.log("finalText", finalText);
      const res = await GptFunctions.openai.chat.completions.create({
        model: GptFunctions.MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert in analyzing and summarizing a webpage. You would be provided with the contents of the webpage you need to provide a summary of the webpage. If there are news articles or blogs present in the website you need to summarize that too.",
          },
          {
            role: "user",
            content: `You need to provide a summary to this webpage whose contents are as follows:\n ${finalText}`,
          },
        ],
      });
      return {
        status: 200,
        json: {
          success: true,
          message: res.choices[0].message.content,
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

  async getFullSummary({ message }) {
    try {
      if (!message) {
        return {
          status: 400,
          message: "message is required",
        };
      }
      let finalWebsitepromtp = "";
      const { data } = await axios.get(message);
      finalWebsitepromtp = await this.getWebsiteDetails(message);
      const $ = cheerio.load(data);
      const links = [];
      $("a").each((i, ele) => {
        const href = $(ele).attr("href");
        if (href && /^https?:\/\//.test(href)) {
          links.push(href);
        }
      });
      const system_prompt = `You are provided with a list of links present on a website, you need to select which links would be appropriate in summarizing the website. You should select the links of about page, careers/jobs page etc which could be used in describing the company's website best. You should avoid picking up such links which are of settings page, contact page, login page testimonial page. respond with only list of links in JSON format donot return any text or anything other than the list of links in JSON format and donot add any template literals or extra spaces or inverted commas which will make parsing the data difficult.`;
      const res = await GptFunctions.openai.chat.completions.create({
        model: GptFunctions.MODEL,
        messages: [
          { role: "system", content: system_prompt },
          {
            role: "user",
            content: `The input links are as follows, you need to select among these links which would be required in analyzing the website contents, the Input format is in JSON and the output should also be in JSON format and donot add any template literals or extra spaces or inverted commas which will make parsing the data difficult.\n ${JSON.stringify(
              links
            )}`,
          },
        ],
      });
      const selectedLinks = JSON.parse(res.choices[0].message.content?.trim());
      const allPagesDetails = await Promise.all(
        selectedLinks?.map(async (el) => {
          return await this.getWebsiteDetails(el);
        })
      );
      finalWebsitepromtp += "\n" + allPagesDetails?.join("\n");
      const system_prompt_final =
        "You are an expert website analyzer. You need to provide a summary to this webpage whose contents are as follows:\n";
      const res_final = await GptFunctions.openai.chat.completions.create({
        model: GptFunctions.MODEL,
        messages: [
          { role: "system", content: system_prompt_final },
          {
            role: "user",
            content: `The content of the wesite is as follows: \n ${finalWebsitepromtp}`,
          },
        ],
      });
      return {
        status: 200,
        json: {
          success: true,
          message: res_final.choices[0].message.content,
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

  async chatbot({ message, conversationId }) {
    try {
      if (!message) {
        return {
          status: 400,
          json: {
            success: false,
            message: "message is required",
          },
        };
      }
      const system_prompt = {
        role: "system",
        content: `You are an helpful assistant`,
      };
      const user_prompt = {
        role: "user",
        content: message,
      };
      let conversation;
      if (!conversationId) {
        const res = await axios.post(`http://localhost:11434/api/chat`, {
          model: "llama3.2",
          messages: [system_prompt, user_prompt],
          stream: false,
          headers: { "Content-Type": "application/json" },
        });
        const assistant_prompt = {
          role: "assistant",
          content: res.data["message"]["content"],
        };
        conversation = new Conversation({
          messages: [system_prompt, user_prompt, assistant_prompt],
        });
        await conversation.save();
        return {
          status: 200,
          json: {
            success: true,
            message: res.data["message"]["content"],
            conversationId: conversation._id,
            role:"ai"
          },
        };
      } else {
        conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return {
            status: 404,
            json: {
              success: false,
              message: "conversation not found",
            },
          };
        }
        conversation.messages.push(user_prompt);
        const response = await axios.post(`http://localhost:11434/api/chat`, {
          model: "llama3.2",
          messages: [...conversation.messages],
          stream: false,
          headers: { "Content-Type": "application/json" },
        });
        const assistant_prompt = {
          role: "assistant",
          content: response.data["message"]["content"],
        };
        conversation.messages.push(assistant_prompt);
        await conversation.save();
        return {
          status: 200,
          json: {
            success: true,
            message: response.data["message"]["content"],
            conversationId: conversation._id,
            role:"ai"
          },
        };
      }
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
}

module.exports = GptFunctions;
