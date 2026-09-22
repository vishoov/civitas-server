import bcrypt from "bcrypt";

const handleHashing= async (password)=>{
    let salt =await bcrypt.genSalt(10);
    let hashedPass= await bcrypt.hash(password, salt);
    return hashedPass;
}

export default handleHashing;