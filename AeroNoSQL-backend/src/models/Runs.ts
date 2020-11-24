import mongoose, { Document } from "mongoose"

export interface RunDataType extends Document {
    runID: number,
    airfoilID: number,
    airfoilObjID: string,
    reynolds: number,
    mach: number,
    polar: {
        alpha: number[],
        cl: number[],
        cd: number[],
        cm: number[],
    },
    polarProperties: {
        clMax: number,
        cl0: number,
        clAlpha: number,
        cdMin: number,
        cdMax: number,
        clCdMax: number,
        cm0: number,
        alphaStall: number,
        alpha0Cl: number,
        alphaClCdMax: number,
    },
    source: string,
    additionalData: object,
    creator: {
        name: string,
        userName: string,
        uid: string
    },
    postedDate: Date,
}

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

export default mongoose.model<RunDataType>('Run',RunsMongoSchema)