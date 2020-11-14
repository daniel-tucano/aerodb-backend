import { isInteger } from "lodash"
import mongoose, { Document } from "mongoose"

export interface ProjectDataType extends Document {
    creator: {
        name: string,
        userName: string,
        userID: string
    },
    name: string,
    airfoils: SelectionAirfoilDataType[],
}

interface SelectionAirfoilDataType {
    airfoilID: number,
    name: string,
    geometrie: { x: number[], y: number[], side: string[] },
    runsData: SelectionRunDataType[],
}

interface SelectionRunDataType {
    runID: number,
    mach: number,
    reynolds: number,
}

const ProjectMongoSchema = new mongoose.Schema({
    creator: {
        name: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        userID: {
            type: String,
            required: true,
        }
    },
    name: {
        type: String,
        required: true,
    },
    airfoils: [{
        airfoilID: {
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
            runID: {
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

export default mongoose.model<ProjectDataType>('Project', ProjectMongoSchema)