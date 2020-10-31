import mongoose, { Document } from "mongoose"

export interface AirfoilDataType extends Document {
    airfoilID: number,
    name: string,
    nameLowerCase: string,
    filename: string,
    geometrie: {
        side: string[],
        x: number[],
        y: number[],
    },
    thickness: number,
    xThickness: number,
    camber: number,
    xCamber: number,
    source: string,
    creator: {
        name: string,
        userName: string,
        userID: string
    },
    postedDate: Date,
    runs: {
        runIDs: number[]
        runObjIDs: string[]
    }
}

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
    filename: {
        type: String,
        required: false,
    },
    geometrie: {
        side: [String],
        x: [Number],
        y: [Number],
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
        userID: {
            type: String,
            required: true,
        }
    },
    postedDate: {
        type: Date,
        required: true,
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

export default mongoose.model<AirfoilDataType>('Airfoil',AirfoilsMongoSchema)