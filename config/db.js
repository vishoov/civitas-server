import mongoose from 'mongoose';

const dbURI = process.env.MONGO_URI;

const connectDB = async () =>{
    try{
        console.log("Trying to connect to MONGODB");
        const connection = await mongoose.connect(dbURI, {
            dbName: "Civitas"
        });
        console.log("Database Connected Successfully");
    }catch(err){
        console.log("Database connection error: ", err.message);
    }
}

export default connectDB;