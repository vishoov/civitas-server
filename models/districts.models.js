import mongoose from "mongoose";

let districtSchema= new mongoose.Schema(
    {
        districtcode: {
            type: String,
            unique: true,
            trim: true,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        stateCode: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)
districtSchema.index({
    stateCode: 1,
    name: 1
})

const District= mongoose.model("district", districtSchema);

export default District;