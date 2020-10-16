const mongoose = require('mongoose')

const AirfoilsMongoSchema = new mongoose.Schema({
    airfoilID: {
        type: Number,
        required: true,
    },
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
        },
        userId: String
    },
    runs: {
        runIDs: {
            type: Array,
            required: false
        },
        runObjIDs: {
            type: Array,
            required: false
        }
    }
})

mongoose.model('Airfoil',AirfoilsMongoSchema)