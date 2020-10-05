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
mongoose.connect('mongodb://mongodb-0.mongodb,mongodb-1.mongodb,mongodb-2.mongodb/aerodb?readPreference=secondaryPreferred', 
{useNewUrlParser: true, useUnifiedTopology: true}).then( () => {
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