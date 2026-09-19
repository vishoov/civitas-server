import express from 'express';
import User from '../models/User.models.js';
import { signToken } from '../auth/jwt.js';

const getAllUsers = async (req, res) => {
    try{
        const users = await User.find({}).select("-password");
        if(!users){
            res.status(400).json({
                success: false,
                message: "Users not available"
            })
        }
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    }catch(err){
        res.status(500).json({
            success : false,
            message: "Failed to fetch users",
            error: err.message
        });
    }
}

const getProfile = async (req, res) => {
    try{
        res.status(200).json({
            success: true,
            user: req.user
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: err.message
        })
    }
}

const getUserById = async (req, res) => {
    try{
        const {id} = req.params;
        const user = await User.findById(id).select("-password");
        if(!user){
            return res.status(404).json({
                success: "false",
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            user
        })

    }catch(err){
        res.status(500).json({
            success: false,
            message: "Failed to fetch the user",
            error: err.message
        })
    }
}

const registerUser = async (req, res) =>{
    try{
        const {username, email, password, districtCode} = req.body;
        if(!username || !password || !email){
            return res.status(400).json({
                success: false,
                message: "Username, password and email are required"
            })
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            res.status(401).json({
                success: false,
                message: "User already exists with this email"
            })
        }
        const user = await User.create({username, email, password, districtCode});
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                districtCode: user.districtCode,
                isActive: user.isActive
            }
        })

    }catch(err){
        res.status(500).json({
            success: false,
            message: "Registration Failed",
            error: err.message
        })
    }
}

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and Password is required",
            })
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid email and password"
            })
        }

        if(!user.isActive){
            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            })
        }
        const token=signToken({id: user.id,email: user.email})

        res.cookie("token",token, {
            maxAge: 30*60*60,
            httpOnly: true,
        } )

        res.status(200).json({
            success: true,
            message: "Login Successful",
            user,
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            success: false,
            message: "Login Failed",
            error: err.message
        })
    }
}


const logoutUser = (req, res)=>{
    try{
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: "Logout failed",
            error: err.message
        })
    }
}


const updateUser = async (req,res) => {
    try{
        const {username,email,password} = req.body;
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        user.username = username;
        user.password = password;
        user.email = email;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: "Failed to update",
            error: err.message
        })
    }
}

const updateById = async (req,res) => {
    try{
        const {id} = req.params;
        const {username, email, role, districtCode, isActive} = req.body;
        const user = await User.findByIdAndUpdate(id, {
            username,
            email, 
            role
        },{
            new: true,
            runValidators: true
        });
        
        if(!user){
            res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.username = username;
        user.email = email;
        user.role = role;
        user.districtCode = districtCode;
        user.isActive = isActive;

        await user.save();
        return res.status(200).json({
            success: true,
            message: "user updated successfully",
            user: user
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: err.message
        });
    }
}

const deleteUser = async (req, res) => {
    try{
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(400).json({
                success: false,
                message: "user not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: err.message
        })
    }
}

export {
    getAllUsers,
    getProfile,
    getUserById,
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    updateById,
    deleteUser
};