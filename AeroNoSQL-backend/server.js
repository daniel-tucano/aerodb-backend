const express = require('express')
const mongoose = require('mongoose')
const mongose_paginate = require('mongoose-paginate-v2')
const cors = require('cors')
const requireDir = require('require-dir')

// Iniciando App
const app = express()
app.use(express.json())
app.use(cors())

// Iniciando Banco de dados
mongoose.connect('mongodb+srv:://mongodb/aerodb?readPreference=secondaryPreferred', 
{useNewUrlParser: true, useUnifiedTopology: true, user: process.env.MONGODB_USER, pass: process.env.MONGODB_PASSWORD}).then( () => {
    console.log('Conexão com o mongoose deu certo')
}).catch(() => {
    console.log('conexão com mongoose falhou')
})

mongoose.plugin(mongose_paginate)

requireDir('./src/models')

// Airfoil = mongoose.model('Airfoil')

// Airfoil.findOne().then( result => {
//     console.log(result)
// })

// Rotas
app.use('/', require('./src/routes'))

app.listen(80)