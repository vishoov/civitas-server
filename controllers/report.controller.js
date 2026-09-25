import Report from "../models/reports.model.js";
import fs from "fs";
import cloudinary from "../services/cloudinary.js";


export const createReport= async (req, res)=>{
    
    let {_id, username, }= req.user;
    let {title, description, pincode, district, state, status }= req.body;
    let userId= _id;

    // console.log(username, userId, title, description, pincode, district, state );

    if( !(title && description && pincode && district && state ))
        return res.status(400).json(
    {
        success: false,
        error: "Required fields of either one or many out of title, description, pincode, district and state are empty."
    })

    try{

        let photoUrl=null;
        if(req.file){
            const result= await cloudinary.uploader.upload(req.file.path, {folder: "reports"});
            photoUrl=result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        let createdReport= await Report.create(
            {
                title,
                description,
                pincode,
                district,
                state,
                photoUrl,
                status,
                username,
                userId
            }
        )

        if(!createdReport)
            throw new Error("Server Error:  Report not created")

        res.status(201).json(
            {
                success: true, 
                createdReport
            }
        )
    }
    catch(err){
        console.log(err);
        res.status(500).json(
            {
                success: false,
                error: "Server Error: Report not created!"
            }
        )
    }



}

export const filterReport= async (req, res)=>{
    let { pg_no }= req.params;
    pg_no=pg_no==0?1:pg_no;
        
    try{
        let { pincode, district, state, status} = req.body;
        let parameters={};
        if(pincode.length)
            parameters.pincode= pincode;
        if(district.length)
            parameters.district= district;
        if(state.length)
            parameters.state= state;
        if(status.length){
            if(!['pending', 'verified', 'rejected', 'resolved'].includes(status))
                return res.status(400).json({success: false, error: "Invalid Report Status"})
            parameters.status= status;
        }
        let filtered_report= await Report.find(parameters).skip(5*(pg_no-1)).limit(5*pg_no);
        if(!filtered_report)
            res.status(400).json({
        success: false,
        error: "Could'nt find any Reports"
        })

        res.status(200).json(
            {
                success: true,
                filtered_report
            }
        )
    }
    catch(err){
        console.log(err.message);
        res.status(500).json(
            {
                success: true,
                error: "Server Error!: Reports not found"
            }
        )
    }

}

export const singleReport =async (req, res)=>{
    let {id}= req.params;

    try{

        let report= await Report.findOne({_id: id});
        if(!report)
            return res.status(400).json({
                success: false,
                error: "Report does'nt exist"
        });
        
        res.status(200).json(
            {
                success: true,
                report
            }
        )
    }
    catch(err){
        console.log(err.message);
        res.status(500).json(
            {
                success: false,
                error: "Server could'nt respond"
            }
        )
    }


}

export const aggregateReport= async (req, res)=>{
    
}

export const getAll= async(req, res)=>{
    try{
        console.log("Working!!")
        let reports= await Report.find();

        res.status(200).json(
            {
                success: true,
                reports
            }
        )
    }
    catch(err){
        console.log(err.message);
        res.status(500).json(
            {
                success: false,
                error: "Server Error: Couldnt fetch the reports"
            }
        )
    }
}