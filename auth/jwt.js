import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
function signToken(payload){
    const token = jwt.sign(
        payload,
        SECRET,
        {
            expiresIn: "30d",
            algorithm: "HS256"
        }
    )
    return token;
}

export {
    signToken
}