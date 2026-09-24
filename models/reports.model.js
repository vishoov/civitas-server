import mongoose from "mongoose";

const reportsSchema= new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            maxLength: 140,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: 2000
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        username: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            trim: true
        },
        district: {
            type: String,
            trim: true,
            required: true
        },
        state: {
            type: String,
            trim: true,
            // enum: [
            //     'Andhra Pradesh',
            //     'Arunachal Pradesh',
            //     'Assam',
            //     'Bihar',
            //     'Chhattisgarh',
            //     'Goa',
            //     'Gujarat',
            //     'Haryana',
            //     'Himachal Pradesh',
            //     'Jharkhand',
            //     'Karnataka',
            //     'Kerala',
            //     'Madhya Pradesh',
            //     'Maharashtra',
            //     'Manipur',
            //     'Meghalaya',
            //     'Mizoram',
            //     'Nagaland',
            //     'Odisha',
            //     'Punjab',
            //     'Rajasthan',
            //     'Sikkim',
            //     'Tamil Nadu',
            //     'Telangana',
            //     'Tripura',
            //     'Uttar Pradesh',
            //     'Uttarakhand',
            //     'West Bengal',
            //     'Andaman and Nicobar Islands',
            //     'Chandigarh',
            //     'Dadra and Nagar Haveli and Daman and Diu',
            //     'Delhi',
            //     'Jammu and Kashmir',
            //     'Ladakh',
            //     'Lakshadweep',
            //     'Puducherry'],
            required: true
        },
        photoUrl: { 
            type: String,
            default: null,
            trim: true
        },
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'resolved'],
            default: 'pending',
            required: true
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        verifiedAt: {
            type: Date,
            default: null
        },
        resolvedAt: {
            type: Date,
            default: null 
        },
    },
    {
        timestamps: true
    }
)
// categories to be added later
reportsSchema.index({ district: 1, status: 1, createdAt: -1 });
reportsSchema.index({ state: 1, status: 1 });
reportsSchema.index({ userId: 1, createdAt: -1 });


const Report= mongoose.model("report", reportsSchema);

export default Report;