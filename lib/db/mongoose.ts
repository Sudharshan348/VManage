import mongoose from "mongoose"
let isConnected = false

const connectDb = async () => {
    if (isConnected) {
        console.log("MongoDB already connected")
        return  
    }
    try {
        const connectionacc = await mongoose.connect(`${process.env.MONGODB_CONNECT}/${"VManage"}`)
        isConnected = true
        console.log(`\n MongoDb connected on host ${connectionacc.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error: ",error)
        process.exit(1)
    }
}

export default connectDb