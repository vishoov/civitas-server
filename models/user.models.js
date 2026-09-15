import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
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
    password:{
        type:String,
        required:[true, "No work without any password"],
        minLength: 8,
        validate:{
            validator: function (password){
                password= password.trim();
                if(password.length<8){
                    return 'Password must be at least 8 characters long'
                }
                let hasUpperCase = false;
                let hasSpecialChar = false;
                let hasNumber = false;
                for(let i=0; i<password.length; i++){
                    const code = password[i];
                    if(code>='A' && code<='Z'){
                        hasUpperCase=true;
                    }
                    else if(code =='@' || code=='#' || code=='$' || code=='%' || code=='&' || code=='*'){
                        hasSpecialChar=true;
                    } 
                    else if (code>='0' && code<='9'){
                        hasNumber=true;
                    }
                }
                return hasUpperCase && hasSpecialChar && hasNumber;
            },
            message:"Invalid Password"
        }
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

//password salt+hashing
userSchema.methods.comparePassword = async function(password){
    console.log("Compare the password");
    return await bcrypt.compare(password, this.password);
}

userSchema.pre('save', async ()=>{
    if(!this.isModified("password")){
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})
const User = mongoose.model("User", userSchema);
export default User;