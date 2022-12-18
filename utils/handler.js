require('dotenv').config()
const { nanoid } = require('nanoid')
const { Client } = require('pg')

const postgres = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: process.env.DB_PASSWORD,
    database: 'postgres',

})

postgres.connect()

async function getAllChat(req) {
    let { userId } = req.params
    userId = userId.toUpperCase()

    try {
        let result = await postgres.query(`
            SELECT EXISTS(SELECT 1 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            AND TABLE_NAME = '${userId}')`)

        if (result.rows[0].exists) {
            result = await postgres.query(`SELECT *
            FROM  (
            SELECT DISTINCT on ("from") * FROM "${userId}"
            ) p
            ORDER  BY timestamp DESC;`)
        }
        else return {
            codeStatus: 404,
            status: 'error',
            message: `There is no user with ${userId} ID`
        }

        return {
            codeStatus: 200,
            status: 'success',
            data: {
                message: result.rows
            }
        }
    } catch (error) {
        return {
            codeStatus: 500,
            status: 'error',
            message: 'Failed to load chat'
        }
    }
}

async function getChatFromUser(req) {
    let { userId, toUserId } = req.params
    userId = userId.toUpperCase()
    toUserId = toUserId.toUpperCase()

    try {
        let result = await postgres.query(`
            SELECT EXISTS(SELECT 1 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            AND TABLE_NAME = '${userId}')`)

        if (result.rows[0].exists) {
            result = await postgres.query(`SELECT * FROM "${userId}" WHERE "from" = '${toUserId}' ORDER BY timestamp DESC`)
        }
        else return {
            codeStatus: 404,
            status: 'error',
            message: `There is no user with ${userId} ID`
        }

        return {
            codeStatus: 200,
            status: 'success',
            data: {
                message: result.rows
            }
        }
    } catch (error) {
        return {
            codeStatus: 500,
            status: 'error',
            message: 'Failed to load chat'
        }
    }
}

async function sendMessage(req) {
    let { message } = req.payload;
    message = checkQuote(message)

    let { userId, toUserId } = req.params
    userId = userId.toUpperCase()
    toUserId = toUserId.toUpperCase()

    const check = await postgres.query(`SELECT EXISTS(SELECT 1 
           FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_TYPE = 'BASE TABLE' 
           AND TABLE_NAME = '${userId}')`)

    const check2 = await postgres.query(`SELECT EXISTS(SELECT 1 
           FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_TYPE = 'BASE TABLE' 
           AND TABLE_NAME = '${toUserId}')`)

    const newMessageId = nanoid(10)
    if (check.rows[0].exists && check2.rows[0].exists) {
        console.log('Sending message')

        await postgres.query(`INSERT INTO "${userId}" ("idmessage","from","to","message","timestamp") VALUES
        ('${newMessageId}','${userId}','${toUserId}','${message}',current_timestamp);`)

        await postgres.query(`INSERT INTO "${toUserId}" ("idmessage","from","to","message","timestamp") VALUES
        ('${newMessageId}','${userId}','${toUserId}','${message}',current_timestamp);`)
    }
    else return {
        codeStatus: 404,
        status: 'error',
        message: `There is no user with IDs of ${userId} ${toUserId}`
    }

    return {
        codeStatus: 201,
        status: 'success',
        message: 'Message sent',
        data: {
            newMessageId: newMessageId
        }

    }
}

async function sendReply(req) {
    let { message } = req.payload;
    message = checkQuote(message)

    let { userId, toUserId, messageId } = req.params
    userId = userId.toUpperCase()
    toUserId = toUserId.toUpperCase()

    try {
        const check = await postgres.query(`SELECT EXISTS(SELECT 1 
           FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_TYPE = 'BASE TABLE' 
           AND TABLE_NAME = '${userId}')`)

        const check2 = await postgres.query(`SELECT EXISTS(SELECT 1 
           FROM INFORMATION_SCHEMA.TABLES 
           WHERE TABLE_TYPE = 'BASE TABLE' 
           AND TABLE_NAME = '${toUserId}')`)

        const newMessageId = nanoid(10)
        if (check.rows[0].exists && check2.rows[0].exists) {

            await postgres.query(`
            INSERT INTO "${userId}" ("idmessage","from","to","message","timestamp","replyto") VALUES
		    ('${newMessageId}','${userId}','${toUserId}','${message}',current_timestamp,'${messageId}');
            
            INSERT INTO "${toUserId}" ("idmessage","from","to","message","timestamp","replyto") VALUES
		    ('${newMessageId}','${userId}','${toUserId}','${message}',current_timestamp,'${messageId}');`)
        }
        else return {
            codeStatus: 404,
            status: 'error',
            message: `There is no user with IDs of ${userId} ${toUserId}`
        }

        return {
            codeStatus: 201,
            status: 'success',
            message: 'Message sent',
            data: {
                newMessageId: newMessageId
            }
        }
    } catch (error) {
        return {
            codeStatus: 500,
            status: 'error',
            message: 'Failed to send a chat'
        }
    }
}

async function registerNewUser(req) {
    const { name, username } = req.payload

    try {
        let result = await postgres.query(`SELECT username FROM users WHERE username = '${username}'`)

        if (result.rows.length !== 0) return {
            codeStatus: 400,
            status: 'error',
            message: `Username of ${username} is already existed`
        }

        const userId = nanoid(6).toUpperCase()
        await postgres.query(`INSERT INTO users (id,name,username) VALUES
        ('${userId}','${name}','${username}');
        
        CREATE TABLE IF NOT EXISTS "${userId}" (
            "idmessage" VARCHAR(10) NOT NULL UNIQUE,
			"from" VARCHAR(6) NOT NULL,
		    "to" VARCHAR(6) NOT NULL,
            "message" VARCHAR(50) NOT NULL,
            "timestamp" TIMESTAMP NOT NULL,
		    "replyto" VARCHAR(10) NULL,
            PRIMARY KEY("idmessage"),
		        CONSTRAINT "fk_from"
			        FOREIGN KEY ("from")
				        REFERENCES users(id)
        );

        ALTER TABLE "${userId}"
        ADD constraint "fk_to"
        FOREIGN KEY ("to")
        REFERENCES users(id);`)

        return {
            codeStatus: 201,
            status: 'success',
            message: 'User created',
            data: {
                userId: userId
            }
        }
    } catch (error) {
        return {
            codeStatus: 500,
            status: 'error',
            message: 'Failed to create a user'
        }
    }
}

function checkQuote(message) {
    return message.replaceAll(`'`, `''`)
}

module.exports = { getAllChat, getChatFromUser, sendMessage, sendReply, registerNewUser }