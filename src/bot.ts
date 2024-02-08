import { Bot, webhookCallback } from 'grammy'
import { MyContext, setupSession } from './session/session'
import { conversations, createConversation } from '@grammyjs/conversations'
import { startConversation } from './conversations/start.conversation'
import { downloadConversation } from './conversations/download.conversation'
import { autoChatAction } from '@grammyjs/auto-chat-action'
import config from './config/config'
import express from 'express'

const bot = new Bot<MyContext>(config.BOT_TOKEN)

bot.api.setMyCommands([
    {
        command: 'start',
        description: 'to start the bot',
    },
    {
        command: 'category',
        description: 'to see the categories click this command',
    },
])

bot.use(setupSession())
bot.use(conversations())
bot.use(createConversation(startConversation))
bot.use(createConversation(downloadConversation))
bot.use(autoChatAction())

bot.command('start', async (ctx) => {
    await ctx.conversation.enter('startConversation')
})

bot.on('message::url', async (ctx) => {
    await ctx.conversation.enter('downloadConversation')
})

bot.catch((error) => {
    console.log(error)
})

if (config.NODE_ENV === 'DEVELOPMENT') {
    bot.start()
} else {
    const port = config.PORT || 3000
    const app = express()
    app.use(express.json())
    app.use(`/${bot.token}`, webhookCallback(bot, 'express'))

    app.get('/', (req, res) => {
        res.json({
            status: 'OK',
            message: 'Bot is running...',
        })
    })

    app.listen(port, () => console.log(`Server listening on port ${port}`))
}
