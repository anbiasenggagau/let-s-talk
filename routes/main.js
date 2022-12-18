const { getAllChat, getChatFromUser, sendMessage, sendReply, registerNewUser } = require('../utils/handler')

async function getFinalRespons(req, h, handler) {
    const result = await handler(req)
    const codeStatus = result.codeStatus

    const res = h.response(result)
    res.code(codeStatus)
    return res
}

const get = [
    {   // Get list of chats
        method: 'GET',
        path: '/chat/{userId}',
        handler: async (req, h) => {
            return await getFinalRespons(req, h, getAllChat)
        }
    },
    {   // Get history chat of certain person
        method: 'GET',
        path: '/chat/{userId}/{toUserId}',
        handler: async (req, h) => {
            return await getFinalRespons(req, h, getChatFromUser)
        }
    },
]

const post = [
    {   // Send message
        method: 'POST',
        path: '/chat/{userId}/{toUserId}',
        handler: async (req, h) => {
            return await getFinalRespons(req, h, sendMessage)
        }
    },
    {   // Reply a message
        method: 'POST',
        path: '/chat/{userId}/{toUserId}/{messageId}',
        handler: async (req, h) => {
            return await getFinalRespons(req, h, sendReply)
        }
    },
    {   // Create a user
        method: 'POST',
        path: '/chat/register',
        handler: async (req, h) => {
            return await getFinalRespons(req, h, registerNewUser)
        }
    },
]

module.exports = [...get, ...post]