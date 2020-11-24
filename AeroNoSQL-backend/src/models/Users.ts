import mongoose, { Document } from "mongoose"

export interface UserDataType extends Document {
    uid: string,
    name: string,
    userName: string,
    email: string,
    gender: string,
    yearOfBirth: Date,
    institution?: string,
    about: string,
    projects: {
        name: string,
        projectID: string
    }[],
    userAirfoils: number[],
    favoriteAirfoils: number[],
} 

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
        projectID: String
    }],
    userAirfoils: [Number],
    favoriteAirfoils: [Number],
})

export default mongoose.model<UserDataType>('User',UserMongoSchema)