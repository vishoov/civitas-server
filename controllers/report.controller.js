import Report from "../models/reports.model.js";
import cloudinary from "../services/cloudinary.js";
import fs from 'fs';

export const createReport= async (req, res)=>{
    
    let {_id, username, }= req.user;
    let {title, description, pincode, district, state, photoUrl, status }= req.body;
    let userId= _id;
    console.log(req.file, req.files);

    //cloudinary logic 



    // console.log(username, userId, title, description, pincode, district, state );

    if( !(title && description && pincode && district && state ))
        return res.status(400).json(
    {
        success: false,
        error: "Required fields of either one or many out of title, description, pincode, district and state are empty."
    })

    try{

        let photoUrl = null;

        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder:"reports"
            })
            photoUrl = result.secure_url;
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
    console.log('filter called')
    const PAGE_SIZE= 5;
    let pg_no= Number(req.params.pg_no);
    if(!Number.isFinite(pg_no) || pg_no < 1)
        pg_no= 1;
    
    try{
        let { pincode, district, state, status} = req.body ?? {};
        // console.log(state, status)
        // let parameters={};
        // if(pincode)
        //     parameters.pincode= pincode;
        // if(district)
        //     parameters.district= district;
        // if(state)
        //     parameters.state= state;
    
        // if(status){
        //     // if(!['pending', 'verified', 'rejected', 'resolved'].includes(status))
        //     //     return res.status(400).json({success: false, error: "Invalid Report Status"})
        //     parameters.status= status;

        // }
        // console.log(parameters)
        const filter = {};
        if(pincode)
            filter.pincode = pincode;
        if(district)
            filter.district = district;
        if(state)
            filter.state = state;
        if(status)
            filter.status = status;

        let filtered_report= await Report.find(filter)
            .skip(PAGE_SIZE*(pg_no-1)).limit(PAGE_SIZE);
        console.log(status, state)
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
                success: false,
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


export const allReports = async (req, res)=>{
    const reports = await Report.find();
    console.log('route called');
    if(!reports){
        return res.status(500).json({
            message:"Some error in getting the reports"
        })
    }

    return res.status(200).json({
        message:"Reports Fetched Successfully",
        reports
    })
}

export const aggregateReport= async (req, res)=>{
    
}