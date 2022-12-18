require('dotenv').config()
const Hapi = require('@hapi/hapi')
const { Client } = require('pg')

const routes = require('./routes/main')
const initialization = require('./utils/tableinit')

const port = process.env.PORT || 5000
// const host = process.env.npm_lifecycle_event === 'dev' ? 'localhost' : '0.0.0.0'
const host = 'localhost'

const postgres = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
})

const init = async () => {

    // Inisialisasi konfigurasi server
    const server = Hapi.server({
        port,
        host,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    await server.start()
    console.log(`Server run on ${server.info.uri}`)

    server.route(routes)
}

postgres.connect(async err => {
    if (err) console.log(`Error : ${err.detail}`)
    else {
        console.log('Connected to Database')
        let result = await initialization(postgres)
        if (result) init()
    }
})
