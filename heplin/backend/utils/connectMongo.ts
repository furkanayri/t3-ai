import Mongoose from "mongoose";
import Bluebird from "bluebird";

export const connectMongo = async () => {
    Mongoose.Promise = Bluebird;
    console.log(`MongoDB Connection String1: ${process.env.MONGO_URI}`);
    
    process.on("unhandledRejection", (reason, p) => {
                console.error("UNHANDLED REJECTION3:", reason);
            });
            process.on("uncaughtException", (err) => {
                console.error("UNCAUGHT EXCEPTION3:", err);
            });
    try {
        await Mongoose.connect(process.env.MONGO_URI);

        return Mongoose.connection;
    } catch (err) {
        console.error(`MongoDB connection error. ${err}`);
        process.exit(1);
    }
};