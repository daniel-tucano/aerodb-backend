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
    about: {
        type: String,
        required: true
    },
    projects: [{
        name: String,
        projectId: String
    }],
    userAirfoils: [String],
    favoriteAirfoils: [String],
    userID: Number,
})

mongoose.model('User',UserMongoSchema)