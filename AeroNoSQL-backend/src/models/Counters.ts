import mongoose, { Document } from "mongoose"

interface CounterDataType extends Document {
    refCollection: string,
    name: string,
    counter: number
}

const CounterMongoSchema = new mongoose.Schema({
    refCollection: String,
    name: String,
    counter: Number,
})

export default mongoose.model<CounterDataType>('Counter',CounterMongoSchema)