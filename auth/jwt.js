import jwt from 'jsonwebtoken';

function signToken(payload){
    const SECRET = process.env.JWT_TOKEN;
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