const mongoose = require('mongoose')

const UserMongoSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    yearOfBirth: {
        type: Date,
        required: true,
    },
    institution: {
        type: String,
        required: false,
    },
    projects: [{
        name: String,
        id: String
    }],
    userAirfoils: [String],
    favoriteAirfoil: [String],
})

mongoose.model('User',UserMongoSchema)