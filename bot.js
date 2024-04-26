const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// keyboards
function createCustomKeyboard() {
  const keyboard = [["Build Sexy Dex(Swap)"], ["Instructions"]];
  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}
function createCancelKeyboard() {
  const keyboard = [["🚫 Cancel"]];
  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}
function sendMessageKeyboard() {
  const keyboard = [["🔠 Message User"]];
  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}
function createBackKeyboard() {
  const keyboard = [["⬅️ Back"]];
  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}
function createConfirmKeyboard() {
  const keyboard = [["✅ Confirm"], ["🚫 Cancel"]];
  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

// Define the function to create the chain selection keyboard
function createChainSelectionKeyboard() {
  const keyboard = [["BSC", "ETH"], ["⬅️ Back"]];
  return {
    keyboard,
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

// useful functions
function backHome(chatId) {
  const replyMarkup = createCustomKeyboard();
  bot
    .sendMessage(
      chatId,
      "Hey baby 💋 \nWanna make a SexyDex? I'll show you 🍑",
      {
        reply_markup: replyMarkup,
      }
    )
    .catch((error) =>
      console.error("Error sending message with keyboard", error)
    );
}
function adminHome(chatId) {
  const replyMarkup = sendMessageKeyboard();
  bot
    .sendMessage(chatId, "Hi Admin, How can I serve you?💋", {
      reply_markup: replyMarkup,
    })
    .then(() => (adminBot.state = ""))
    .catch((error) =>
      console.error("Error sending message with keyboard", error)
    );
}

function backToSelectChain(chatId) {
  const replyMarkup = createChainSelectionKeyboard();
  bot
    .sendMessage(chatId, "Select your preferred chain👙", {
      reply_markup: replyMarkup,
    })
    .then(() => (dexBot.state = "chain"))
    .catch((error) =>
      console.error("Error sending message with keyboard:", error)
    );
}

async function handleImageUpload(chatId, message) {
  try {
    // Assuming message.photo contains the uploaded image
    if (message.photo) {
      const photo = message.photo[message.photo.length - 1]; // Get the highest resolution photo
      const photoId = photo.file_id;
      const file = await bot.getFile(photoId);
      const photoUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      console.log("image was uploaded", photoUrl);
      userState.logoUrl = photoUrl;
      userState.hasLogo = true;
      // Use getFile method to get the file path of the uploaded image
      const replyMarkup = createConfirmKeyboard();
      await bot.sendMessage(
        chatId,
        `| *SexyDex Order Summary* 😍 |\n\n` +
          `_Project Name:_ ${userState.projectName}\n` +
          `_Chain:_ ${userState.chain}\n` +
          `_Token Symbol:_ ${userState.symbol}\n` +
          `_Token Address:_ \`${userState.contractAddress}\`\n` +
          `_Telegram Link:_ [Telegram](${userState.telegramLink})\n` +
          `_Twitter Link:_ [Twitter](${userState.twitterLink})\n` +
          `_Uploaded LogoFile:_ ${userState.hasLogo}\n\n` +
          `_Uploaded BgFile:_ ${userState.hasBg}\n\n` +
          `_(If there's any error, press cancel to restart)_`,
        { parse_mode: "Markdown", reply_markup: replyMarkup }
      );
      dexBot.state = "payment";
    }
  } catch (error) {
    console.error("Error handling image upload:", error);
    // Handle the error here, such as sending a message to the user or logging it
    const replyMarkup = createCancelKeyboard();
    bot
      .sendMessage(
        chatId,
        "📤 An Error occured while handling image upload\n\n_ (Please upload your Project (Token) Logo Again.) _",
        { parse_mode: "Markdown", reply_markup: replyMarkup }
      )
      .then(() => (dexBot.state = "review"))
      .catch((error) =>
        console.error("Error sending message with keyboard:", error)
      );
  }
}
async function handleBgUpload(chatId, message) {
  try {
    // Assuming message.photo contains the uploaded image
    if (message.photo) {
      const photo = message.photo[message.photo.length - 1]; // Get the highest resolution photo
      const photoId = photo.file_id;
      const file = await bot.getFile(photoId);
      const bgUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      console.log("bg was uploaded", bgUrl);
      userState.bgUrl = bgUrl;
      userState.hasBg = true;
      const replyMarkup = createCancelKeyboard();
      // Use getFile method to get the file path of the uploaded image
      bot
        .sendMessage(
          chatId,
          "📤 Please upload your Project (Token) Logo.\n\n_ (upload Logo file here) _",
          { parse_mode: "Markdown", reply_markup: replyMarkup }
        )
        .then(() => {
          dexBot.state = "review";
          console.log("done");
        })
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    }
  } catch (error) {
    console.error("Error handling bg upload:", error);
    // Handle the error here, such as sending a message to the user or logging it
    const replyMarkup = createCancelKeyboard();
    bot
      .sendMessage(
        chatId,
        "📤 An Error occurred while handling the background image.\nIf you don't have any valid image, input :- none \n\n_ (upload Bg file here) _",
        { parse_mode: "Markdown", reply_markup: replyMarkup }
      )
      .then(() => (dexBot.state = "img"))
      .catch((error) =>
        console.error("Error sending message with keyboard:", error)
      );
  }
}

// Assuming userState object contains the necessary data
async function forwardOrderSummary(chatId, receiverUsername) {
  try {
    // Construct the message with variables
    const message =
      `SexyDex Order Summary 😍 \n\n` +
      `Client Name : @${userState.user}\n` +
      `Client UserId : ${userState.userId}\n` +
      `Project Name : ${userState.projectName}\n` +
      `Chain : ${userState.chain}\n` +
      `Token Symbol : ${userState.symbol}\n` +
      `Token Address : ${userState.contractAddress}\n` +
      `Telegram Link : ${userState.telegramLink}\n` +
      `Twitter Link : ${userState.twitterLink}\n` +
      `Uploaded BgFile : ${userState.hasBg}\n` +
      `BgFile Link : ${userState.bgUrl}\n` +
      `Uploaded LogoFile : ${userState.hasLogo}\n` +
      `LogoFile Link : ${userState.logoUrl}\n` +
      `Payment Link/Hash : ${userState.paymentLink}\n\n` +
      `(To be delivered in 3 - 5 hours)`;
    // Forward the message to the receiver username
    await bot.sendMessage(receiverUsername, message);
    console.log("Order summary forwarded successfully.");
  } catch (error) {
    console.error("Error forwarding order summary:", error);
  }
}
async function sendImageAndCaption(
  receiverId,
  adminId,
  imagePath,
  captionText
) {
  try {
    await bot.sendPhoto(receiverId, imagePath, {
      caption: captionText,
      parse_mode: "Markdown",
    });
    bot.sendMessage(adminId, "Message sent to user ✅");
    adminHome(adminId);
  } catch (error) {
    console.error(`Error sending image and caption: ${error.message}`);
    bot.sendMessage(
      adminId,
      `*Failed!* \nUser with ID _${adminUserMessage.userId}_ does not exist`,
      {
        parse_mode: "Markdown",
      }
    );
    adminHome(adminId);
  }
}

function isUrl(str) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

// manage bot state
let dexBot = { state: "" };

// when the bot is acting as an admin
let adminBot = { state: "" };

// manage user data state
let userState = {
  user: "",
  userId: "",
  chain: "",
  projectName: "",
  contractAddress: "",
  symbol: "",
  telegramLink: "",
  twitterLink: "",
  logoUrl: "",
  bgUrl: "",
  hasLogo: false,
  hasBg: false,
  paymentLink: "",
};

// Handle the cancel button
bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id;
  const currentState = dexBot.state;
  // Depending on the current state, take appropriate action
  if (currentState === "chain") {
    const replyMarkup = createCustomKeyboard();
    bot
      .sendMessage(
        chatId,
        "Hey baby 💋 \nWanna make a SexyDex? I'll show you 🍑",
        {
          reply_markup: replyMarkup,
        }
      )
      .catch((error) =>
        console.error("Error sending message with keyboard", error)
      );
    dexBot.state = "";
  } else if (currentState === "token") {
    // Go back to chain selection
    const replyMarkup = createChainSelectionKeyboard();
    bot.sendMessage(chatId, "Select your preferred chain👙", {
      reply_markup: replyMarkup,
    });
    dexBot.state = "chain"; // Update the state to 'chain'
  }
});

// ADMINS
const BCList = ["6192401437", "-1001991653026", "1765699399", "1336249413"];

const adminUserMessage = {
  userId: "",
  dexLink: "",
  tgLink: "",
};
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  userState.user = msg.from.username;
  // if the user is an admin
  // handle admin function
  if (BCList.includes(chatId.toString())) {
    if (messageText === "/start" || messageText === "/bot") {
      const replyMarkup = sendMessageKeyboard();
      bot
        .sendMessage(chatId, "Hi Admin, How can I serve you?💋", {
          reply_markup: replyMarkup,
        })
        .catch((error) =>
          console.error("Error sending message with keyboard", error)
        );
    } else if (messageText === "🔠 Message User") {
      const replyMarkup = createCancelKeyboard();
      bot
        .sendMessage(chatId, "What UserId do you want message?", {
          reply_markup: replyMarkup,
        })
        .then(() => (adminBot.state = "dexlink"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    } else if (messageText === "🚫 Cancel") {
      adminHome(chatId);
    } else {
      if (adminBot.state == "dexlink") {
        adminUserMessage.userId = messageText;
        const replyMarkup = createCancelKeyboard();
        bot
          .sendMessage(chatId, "Ordered Dexlink:", {
            reply_markup: replyMarkup,
          })
          .then(() => (adminBot.state = "channellink"))
          .catch((error) =>
            console.error("Error sending message with keyboard:", error)
          );
      } else if (adminBot.state == "channellink") {
        adminUserMessage.dexLink = messageText;
        const replyMarkup = createCancelKeyboard();
        bot
          .sendMessage(chatId, "Link to TG Channel:", {
            reply_markup: replyMarkup,
          })
          .then(() => (adminBot.state = "confirm"))
          .catch((error) =>
            console.error("Error sending message with keyboard:", error)
          );
      } else if (adminBot.state == "confirm") {
        adminUserMessage.tgLink = messageText;
        const replyMarkup = createConfirmKeyboard();
        bot
          .sendMessage(
            chatId,
            `*Confirm message to be sent!* \n\n` +
              `_UserID :_ ${adminUserMessage.userId}\n` +
              `_User DexLink_ : ${adminUserMessage.dexLink}\n` +
              `_Link to channel :_ ${adminUserMessage.tgLink}\n`,
            {
              parse_mode: "Markdown",
              reply_markup: replyMarkup,
            }
          )
          .then(() => (adminBot.state = "sendMessage"))
          .catch((error) =>
            console.error("Error sending message with keyboard:", error)
          );
      } else if (adminBot.state == "sendMessage") {
        if (messageText === "✅ Confirm") {
          // send message
          const message =
            `💬 *Admin Message* 💋 \n` +
            `--------------------------------\n\n` +
            `*Your Dex is Live* :- ${adminUserMessage.dexLink}\n` +
            `*Dex was listed here* : ${adminUserMessage.tgLink}\n`;
          sendImageAndCaption(
            adminUserMessage.userId,
            chatId,
            "./banner.jpg",
            message
          );
          // send the message
        } else if (messageText === "🚫 Cancel") {
          adminHome(chatId);
        }
      }
    }
  } else {
    // if the user is not an admin, show the create dex Order functions
    if (messageText === "/start") {
      const replyMarkup = createCustomKeyboard();
      bot
        .sendMessage(
          chatId,
          "Hey baby 💋 \nWanna make a SexyDex? I'll show you 🍑",
          {
            reply_markup: replyMarkup,
          }
        )
        .catch((error) =>
          console.error("Error sending message with keyboard", error)
        );
    } else if (messageText === "Build Sexy Dex(Swap)") {
      const replyMarkup = createChainSelectionKeyboard();
      bot
        .sendMessage(chatId, "Select your preferred chain👙", {
          reply_markup: replyMarkup,
        })
        .then(() => (dexBot.state = "chain"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    } else if (messageText === "Instructions") {
      const replyMarkup = createBackKeyboard();
      bot
        .sendMessage(
          chatId,
          "Please strictly adhere to these instructions 😈: \n\n" +
            "- Fill in the right details for your swap ✅ \n" +
            "- When done with sending all details, I will show you all of them again so you can confirm and if any is wrong, you can cancel and reenter the correct details 😉😘 \n\n" +
            "_With ❤️ from SexyDex 💋_",
          {
            parse_mode: "Markdown",
            reply_markup: replyMarkup,
          }
        )
        .then(() => (dexBot.state = ""))
        .catch((error) =>
          console.error("Error sending message with keyboard", error)
        );
    } else {
      // Check if the user's response needs to be handled
      const currentState = dexBot.state;
      // console.log("check" + currentState);
      if (currentState !== "") {
        handleUserResponse(msg, currentState);
      } else {
        if (messageText === "⬅️ Back") {
          backHome(chatId);
        }
      }
    }
  }
});

// Define the function to handle user responses
function handleUserResponse(msg, currentState) {
  const chatId = msg.chat.id;
  userState.userId = chatId;
  const messageText = msg.text;
  if (currentState === "chain") {
    if (messageText === "BSC" || messageText === "ETH") {
      userState.chain = messageText;
      const replyMarkup = createCancelKeyboard();
      // Ask for token/project name
      bot
        .sendMessage(
          chatId,
          "Let's create your own Sexy Dex(Swap) 😍\n\n🔠_ Please enter your token (Project) name _",
          {
            parse_mode: "Markdown",
            reply_markup: replyMarkup,
          }
        )
        .then(() => (dexBot.state = "contract")) // Set the state to 'token' after chain selection
        .catch((error) =>
          console.error("Error sending message with keyboard", error)
        );
    } else if (messageText === "⬅️ Back") {
      dexBot.state = "";
      backHome(chatId);
    } else {
      // Handle invalid chain selection
      // Send message indicating invalid input and prompt user to select again
      const replyMarkup = createChainSelectionKeyboard();
      bot
        .sendMessage(
          chatId,
          "I am bullish on only BSC and ETH rn \n\nSelect your preferred chain👙",
          { reply_markup: replyMarkup }
        )
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    }
    // for SOL dex
    // else if (messageText === "SOL") {
    // }
  } else if (currentState === "contract") {
    if (messageText === "🚫 Cancel" || messageText == "") {
      backToSelectChain(chatId);
    } else {
      const replyMarkup = createCancelKeyboard();
      userState.projectName = messageText;
      bot
        .sendMessage(
          chatId,
          "🔠 Please enter your Project (Token) Contract Address",
          { reply_markup: replyMarkup }
        )
        .then(() => (dexBot.state = "symbol"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    }
  } else if (currentState === "symbol") {
    if (messageText === "🚫 Cancel" || messageText == "") {
      backToSelectChain(chatId);
    } else {
      const replyMarkup = createCancelKeyboard();
      userState.contractAddress = messageText;
      bot
        .sendMessage(
          chatId,
          "🔠 Please enter your Project (Token) Symbol Address.\n\n_ example :-  $ASS _",
          { parse_mode: "Markdown", reply_markup: replyMarkup }
        )
        .then(() => (dexBot.state = "tg"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    }
  } else if (currentState === "tg") {
    if (messageText === "🚫 Cancel" || messageText == "") {
      backToSelectChain(chatId);
    } else {
      const replyMarkup = createCancelKeyboard();
      userState.symbol = messageText;
      bot
        .sendMessage(
          chatId,
          "🔠 Please enter your Project Telegram Group Link.\n\n_ If you don't have input :- none _",
          { parse_mode: "Markdown", reply_markup: replyMarkup }
        )
        .then(() => (dexBot.state = "tw"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    }
  } else if (currentState === "tw") {
    if (messageText === "🚫 Cancel" || messageText == "") {
      backToSelectChain(chatId);
    } else if (isUrl(messageText) || messageText.toLowerCase() == "none") {
      const replyMarkup = createCancelKeyboard();
      userState.telegramLink = messageText;
      bot
        .sendMessage(
          chatId,
          "🔠 Please enter your Project Twitter Link.\n\n_ If you don't have input :- none _",
          { parse_mode: "Markdown", reply_markup: replyMarkup }
        )
        .then(() => (dexBot.state = "bg"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    } else {
      // ask user to reenter telegram link
      const replyMarkup = createCancelKeyboard();
      bot
        .sendMessage(
          chatId,
          "🔠 Please enter a Valid Telegram Group Link.\n\n_ If you don't have input :- none _",
          { parse_mode: "Markdown", reply_markup: replyMarkup }
        )
        .then(() => (dexBot.state = "tw"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    }
  } else if (currentState === "bg") {
    if (messageText === "🚫 Cancel" || messageText == "") {
      backToSelectChain(chatId);
    } else if (isUrl(messageText) || messageText.toLowerCase() == "none") {
      const replyMarkup = createCancelKeyboard();
      userState.twitterLink = messageText;
      bot
        .sendMessage(
          chatId,
          "📤 Please upload your preferred swap background ( 1920 x 1154px ).\nIf you don't have any, input :- none \n\n_ (upload Logo file here) _",
          { parse_mode: "Markdown", reply_markup: replyMarkup }
        )
        .then(() => (dexBot.state = "img"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    } else {
      // ask user to reenter twitter link
      const replyMarkup = createCancelKeyboard();
      bot
        .sendMessage(
          chatId,
          "🔠 Please enter a Valid Twitter Link.\n\n_ If you don't have input :- none _",
          { parse_mode: "Markdown", reply_markup: replyMarkup }
        )
        .then(() => (dexBot.state = "bg"))
        .catch((error) =>
          console.error("Error sending message with keyboard:", error)
        );
    }
  } else if (currentState === "img") {
    if (messageText === "🚫 Cancel" || messageText == "") {
      backToSelectChain(chatId);
    } else {
      if (msg.photo) {
        handleBgUpload(chatId, msg); //this
      } else if (messageText.toLowerCase() == "none") {
        const replyMarkup = createCancelKeyboard();
        userState.bgUrl = messageText;
        bot
          .sendMessage(
            chatId,
            "📤 Please upload your Project (Token) Logo.\n\n_ (upload Logo file here) _",
            { parse_mode: "Markdown", reply_markup: replyMarkup }
          )
          .then(() => (dexBot.state = "review"))
          .catch((error) =>
            console.error("Error sending message with keyboard:", error)
          );
      }
      // ask user to reenter twitter link
      else {
        const replyMarkup = createCancelKeyboard();
        bot
          .sendMessage(
            chatId,
            "📤 Invalid Input!!!\n\n_ Please upload your preferred background image. _",
            { parse_mode: "Markdown", reply_markup: replyMarkup }
          )
          .then(() => (dexBot.state = "img"))
          .catch((error) =>
            console.error("Error sending message with keyboard:", error)
          );
      }
    }
  } else if (currentState === "review") {
    if (messageText === "🚫 Cancel" || messageText == "") {
      backToSelectChain(chatId);
    } else {
      if (msg.photo) {
        handleImageUpload(chatId, msg);
      } else {
        const replyMarkup = createCancelKeyboard();
        bot
          .sendMessage(
            chatId,
            "📤 Invalid Input!!!\n\n_ Please upload your Project (Token) Logo. _",
            { parse_mode: "Markdown", reply_markup: replyMarkup }
          )
          .then(() => (dexBot.state = "review"))
          .catch((error) =>
            console.error("Error sending message with keyboard:", error)
          );
      }
    }
  } else if (currentState === "payment") {
    if (messageText === "🚫 Cancel") {
      backToSelectChain(chatId);
    } else if (messageText === "✅ Confirm") {
      // First message
      if (userState.chain === "BSC") {
        bot
          .sendMessage(
            chatId,
            "🎉 Congratulations! 🎉\n" +
              "One step from getting your dex!\n\n" +
              "You have 2 Options:\n\n" +
              "_Option 1: For a custom swap using our domain, you will need to pay 0.05BNB._\n" +
              "_Option 2: If you would like a custom domain, you will need to pay 0.1BNB._\n\n" +
              "You can pay to our Sexy Dev wallet.\n" +
              "Dev Wallet Address: `0x49416224bf4BbfA57E6C39DB7939d4B7584Acf73`\n" +
              "(You can pay with USDT/BNB/ETH)\n\n" +
              "_Once Done, send your payment transaction hash/link (or send your wallet address, we can verify) _",
            { parse_mode: "Markdown" }
          )
          .then(() => {
            // After the first message is sent, send the second message with the keyboard
            const replyMarkup = createCancelKeyboard();
            bot
              .sendMessage(
                chatId,
                "🔠 Please send your payment transaction hash/link _ (or send your wallet address, we can verify) _",
                {
                  parse_mode: "Markdown",
                  reply_markup: replyMarkup,
                }
              )
              .then(() => {
                // Set the bot's state after sending the second message
                dexBot.state = "done";
              })
              .catch((error) =>
                console.error(
                  "Error sending second message with keyboard:",
                  error
                )
              );
          })
          .catch((error) =>
            console.error("Error sending first message:", error)
          );
      } else if (userState.chain === "ETH") {
        bot
          .sendMessage(
            chatId,
            "🎉 Congratulations! 🎉\n" +
              "One step from getting your dex!\n\n" +
              "You have 2 Options:\n\n" +
              "_Option 1: For a custom swap using our domain, you will need to pay 0.02ETH._\n" +
              "_Option 2: If you would like a custom domain, you will need to pay 0.035ETH._\n\n" +
              "You can pay to our Sexy Dev wallet.\n" +
              "Dev Wallet Address: `0x49416224bf4BbfA57E6C39DB7939d4B7584Acf73`\n" +
              "(You can pay with USDT/BNB/ETH)\n\n" +
              "_Once Done, send your payment transaction hash/link (or send your wallet address, we can verify) _",
            { parse_mode: "Markdown" }
          )
          .then(() => {
            // After the first message is sent, send the second message with the keyboard
            const replyMarkup = createCancelKeyboard();
            bot
              .sendMessage(
                chatId,
                "🔠 Please send your payment transaction hash/link _ (or send your wallet address, we can verify) _",
                {
                  parse_mode: "Markdown",
                  reply_markup: replyMarkup,
                }
              )
              .then(() => {
                // Set the bot's state after sending the second message
                dexBot.state = "done";
              })
              .catch((error) =>
                console.error(
                  "Error sending second message with keyboard:",
                  error
                )
              );
          })
          .catch((error) =>
            console.error("Error sending first message:", error)
          );
      }
    }
  } else if (currentState === "done") {
    if (messageText === "🚫 Cancel") {
      backToSelectChain(chatId);
    } else {
      userState.paymentLink = messageText;
      // list of chatIds to send message
      // send userState as a message to @livingstone @jude @shahab
      BCList.forEach((userId) => {
        forwardOrderSummary(chatId, userId);
      });

      const replyMarkup = createCustomKeyboard();
      bot
        .sendMessage(
          chatId,
          "✅ Your Request has been sent and is being processed! \n\n" +
            "You will receive your swap within 3 hours _(max 8 hours)_ \n\n" +
            "_With ❤️ from SexyDex 💋_",
          {
            parse_mode: "Markdown",
            reply_markup: replyMarkup,
          }
        )
        .then(() => {
          dexBot.state = "";
        })
        .catch((error) =>
          console.error("Error sending message with keyboard", error)
        );
    }
  }
}

bot.on("polling_error", (error) => {
  console.error(error);
});

console.log("Bot is running...");

// image saving, sending to @degojou, @livingstone and @otherdev
