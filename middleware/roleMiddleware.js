const adminOnly = (req, res, next) => {
    if(req.user.role!=="Admin"){
        return res.status(403).json({
            success: false,
            message: "Success denied, only admin"
        });
    }

    next();
}

export default adminOnly;