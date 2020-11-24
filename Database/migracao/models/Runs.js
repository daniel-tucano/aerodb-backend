const mongoose = require('mongoose')

const RunsMongoSchema = new mongoose.Schema({
    runID: {
        type: Number,
        required: true,
    },
    airfoilID: {
        type: Number,
        required: true,
    },
    airfoilObjID: {
        type: String,
        required: true,
    },
    reynolds: {
        type: Number,
        required: true,
    },
    mach: {
        type:Number,
        required: true,
    },
    polar: {
        alpha: [Number],
        cl: [Number],
        cd: [Number],
        cm: [Number],
    },
    polarProperties: {
        clMax: Number,
        cl0: Number,
        clAlpha: Number,
        cdMin: Number,
        cdMax: Number,
        clCdMax: Number,
        cm0: Number,
        alphaStall: Number,
        alpha0Cl: Number,
        alphaClCdMax: Number,
    },
    source: {
        type: String,
        required: true,
    },
    additionalData: {
        type: Map,
        required: false,
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
        uid: {
            type: String,
            required: true,
        }
    },
    postedDate: {
        type: Date,
        required: true,
    },
})

mongoose.model('Run',RunsMongoSchema)