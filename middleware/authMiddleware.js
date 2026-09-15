import jwt from 'jsonwebtoken';
import User from '../models/User.models.js';

const authMW = async (req, res) => {
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({
                success: false,
                message: "Invalid token, not found"
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if(!user.isActive){
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            })
        }

        req.user = user;
        next();
    }catch(err){
        res.status(500).json({
            success: false,
            message: "Invalid or expired token"       
        })
    }
}

export default authMW;