const adminOnly = (req, res, next) => {
    if(!req.user){
        return res.status(401).json({
            message: "User not authenticated"
        })
    }

    if(req.user.role!=="Admin"){
        return res.status(401).json({
            success: false,
            message: "Success denied, only admin"
        });
    }
    next();
}

export default adminOnly;