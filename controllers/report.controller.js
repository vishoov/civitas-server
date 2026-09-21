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
    // let {_id}= req.user;
    
    
    try{
        let { pincode, district, state} = req.body;
        let parameters={};
        if(pincode.length)
            parameters.pincode= pincode;
        if(district.length)
            parameters.district= district;
        if(state.length)
            parameters.state= state;

        let filtered_report= await Report.find(parameters);
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