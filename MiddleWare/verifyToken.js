const JWT = require('jsonwebtoken');
const generateError = require('../MiddleWare/generateError');
const {FAIL} = require('../MiddleWare/handleRes');


const verifyToken=(req,res,next)=>{
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
            return next(generateError("token required", 400, FAIL));

    }
    const token = authHeader.split(' ')[1];
    try {
        const loadedToken = JWT.verify(token, process.env.JWT_SECRET_KEY );
        next()
    } catch (error) {
            return next(generateError("invalid token ", 401, FAIL));
        
    }

}

module.exports = verifyToken;