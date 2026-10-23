import mongoose from "mongoose";
import { db } from "../contant.js";



const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${db}`);
        console.log(`mongodb connected !!`);
        
    } catch (error) {
        console.log("Error: ", error);
        process.exit(1);
    }
}

export default connectDB