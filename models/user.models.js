import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        maxLength: [100, "Name can be of 100 characters"],
        minLength: [3, "Name must be greater than 3 characters"]
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: true,
        lowercase: true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters long"]
    },
    role:{
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    },
    districtCode: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    schemaVersion: {
        type: Number,
        default: 1
    }
},{
    timestamps: true
});


const User = mongoose.model("User", UserSchema);
export default User;