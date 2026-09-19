import Report from "../models/reports.model.js";


export const createReport= async (req, res)=>{
    
    let {_id, username, }= req.user;
    let {title, description, pincode, district, state, photoUrl, status }= req.body;
    let userId= _id;

    // console.log(username, userId, title, description, pincode, district, state );

    if( !(title && description && pincode && district && state ))
        return res.status(400).json(
    {
        success: false,
        error: "Required fields of either one or many out of title, description, pincode, district and state are empty."
    })

    try{

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
    
}