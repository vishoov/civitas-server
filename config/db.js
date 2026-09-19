import mongoose from 'mongoose';


const connectDB = async () =>{
    const dbURI = process.env.MONGOURI;
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