import express from 'express';
import mongoose from 'mongoose';

const stateSchema = new mongoose.Schema({
    stateCode: {
        type: String,
        required: [true, "State Code is required"],
        trim: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, "Please enter the state's name"],
        trim: true,
        enum: ['state', 'ut']
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
})

const State = mongoose.model("StateCode", stateSchema);
export default State;