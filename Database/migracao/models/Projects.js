const mongoose = require('mongoose')

const ProjectMongoSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    airfoils: [{
        airfoilId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        geometrie: {
            side: [String],
            x: [Number],
            y: [Number],
        },
        runsData: [{
            runId: {
                type: Number,
                required: true,
            },
            mach: {
                type: Number,
                required: true,
            },
            reynolds: {
                type: Number,
                required: true,
            },
        }]
    }]
})

mongoose.model('Project', ProjectMongoSchema)