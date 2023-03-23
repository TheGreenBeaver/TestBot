import { Bot } from 'grammy';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  process.exit(1);
}

const bot = new Bot(token);

type ChatData = { processingAmt: number, intervalId: NodeJS.Timer };

class Typer {
  private processingChats: Record<number, ChatData> = {};

  startProcessing(chatId: number) {
    const chatData = this.processingChats[chatId];

    if (!chatData || chatData.processingAmt === 0) {
      this.processingChats[chatId] = {
        processingAmt: 1,
        intervalId: this.launch(chatId),
      };
    } else {
      chatData.processingAmt++;
    }
  }

  finishProcessing(chatId: number) {
    const chatData = this.processingChats[chatId];

    if (!chatData) {
      return;
    }

    chatData.processingAmt = Math.max(0, chatData.processingAmt - 1);
    this.cancel(chatId);

    if (chatData.processingAmt !== 0) {
      chatData.intervalId = this.launch(chatId);
    }
  }

  private sendTyping(chatId: number) {
    bot.api.sendChatAction(chatId, 'typing')
  }

  private launch(chatId: number): NodeJS.Timer {
    this.sendTyping(chatId);

    return setInterval(() => this.sendTyping(chatId), 5000);
  }

  private cancel(chatId: number) {
    const chatData = this.processingChats[chatId];

    clearInterval(chatData?.intervalId);
  }
}

const typer = new Typer();

const performHeavyStuff = async (chatId: number, repliedTo: string) => {
  // ...
  await new Promise(resolve => setTimeout(resolve, 20000));

  await bot.api.sendMessage(chatId, `done processing ${repliedTo}`);
  typer.finishProcessing(chatId);
};

bot.on('message:text', ctx => {
  const { from: { id }, message: { text } } = ctx;

  typer.startProcessing(id);
  performHeavyStuff(id, text);
});

bot.start();