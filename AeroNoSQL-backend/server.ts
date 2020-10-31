import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
const cookieParser = require('cookie-parser')
const requireDir = require('require-dir')

// Load enviroment variables if not in production
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const { NODE_PORT, CORS_ORIGIN, MONGODB_URI, MONGODB_USER, MONGODB_PASSWORD} = process.env

// Checks if all enviroment variables exists
if ( !NODE_PORT || !CORS_ORIGIN || !MONGODB_URI || !MONGODB_USER || !MONGODB_PASSWORD ) {
    throw new Error("Some enviroment variable is missign");
}

// Iniciando App
const app = express()
app.use(express.json())
app.use(cors({origin: CORS_ORIGIN.split(','), credentials: true}))
app.use(cookieParser())

// Iniciando Banco de dados
mongoose.connect(MONGODB_URI as string, 
{useNewUrlParser: true, useUnifiedTopology: true, auth: {user: MONGODB_USER, password: MONGODB_PASSWORD}} as mongoose.ConnectionOptions).then( () => {
    console.log('Conexão com o mongoose deu certo')
}).catch((erro) => {
    console.log('conexão com mongoose falhou')
    console.log(erro)
})

// Obtendo Modelos
requireDir('./src/models')

// Rotas
app.use('/', require('./src/routes'))

app.listen(NODE_PORT)