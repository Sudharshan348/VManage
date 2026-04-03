import mongoose from "mongoose"
let isConnected = false

const connectDb = async () => {
    if (isConnected) {
        return  
    }

    const mongoUri = process.env.MONGODB_CONNECT
    if (!mongoUri) {
        throw new Error("MONGODB_CONNECT is not defined")
    }

    try {
        const connectionacc = await mongoose.connect(mongoUri, {
            dbName: "VManage",
            serverSelectionTimeoutMS: 10000,
        })
        isConnected = true
        console.log(`\n MongoDb connected on host ${connectionacc.connection.host}`)
    } catch (error) {
        console.error("Mongodb connection error:", error)
        throw error
    }
}

export default connectDb
