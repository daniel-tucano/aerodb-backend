const mongoose = require('mongoose')

const AirfoilsMongoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    nameLowerCase: {
        type: String,
        required: true,
        lowercase: true,
    },
    geometrie: {
        Side: [String],
        X: [Number],
        Y: [Number],
    },
    thickness: {
        type: Number,
        required: true,
    },
    xThickness: {
        type: Number,
        required: true,
    },
    camber: {
        type: Number,
        required: true,
    },
    xCamber: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    creator: {
        name: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        }
    },
})

mongoose.model('Airfoil',AirfoilsMongoSchema)