const express = require('express')
const mongoose = require('mongoose')
const mongose_paginate = require('mongoose-paginate-v2')
const cors = require('cors')
const requireDir = require('require-dir')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// Iniciando App
const app = express()
app.use(express.json())
app.use(cors())

// Iniciando Banco de dados

mongoose.connect(process.env.MONGODB_URI, 
{useNewUrlParser: true, useUnifiedTopology: true, auth: {user: process.env.MONGODB_USER, password: process.env.MONGODB_PASSWORD}}).then( () => {
    console.log('Conexão com o mongoose deu certo')
}).catch((erro) => {
    console.log('conexão com mongoose falhou')
    console.log(erro)
})

mongoose.plugin(mongose_paginate)

requireDir('./src/models')

// Rotas
app.use('/', require('./src/routes'))

app.listen(process.env.NODE_PORT)