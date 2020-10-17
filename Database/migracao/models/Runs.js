const mongoose = require('mongoose')

const RunsMongoSchema = new mongoose.Schema({
    runID: {
        type: Number,
        required: true,
    },
    airfoilID: {
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
        name: String,
        userName: String,
    },
    runDate: {
        type: Date,
        required: false,
    },
})

mongoose.model('Run',RunsMongoSchema)