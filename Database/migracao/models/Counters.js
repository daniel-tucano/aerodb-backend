const mongoose = require('mongoose')

const CounterMongoSchema = new mongoose.Schema({
    refCollection: String,
    name: String,
    counter: Number,
})

mongoose.model('Counter',CounterMongoSchema)