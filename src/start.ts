import { Bot } from 'grammy';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  process.exit(1);
}

const bot = new Bot(token);

const intervalIds: Record<number, NodeJS.Timer> = {};

const performHeavyStuff = async (chatId: number) => {
  // ...
  await new Promise(resolve => setTimeout(resolve, 32000));

  clearInterval(intervalIds[chatId]);
  bot.api.sendMessage(chatId, 'done!');
};

bot.on('message', ctx => {
  const chatId = ctx.chat.id;

  intervalIds[chatId] = setInterval(() => {
    bot.api.sendChatAction(chatId, 'typing');
  }, 5000);

  performHeavyStuff(chatId);
});

bot.start();