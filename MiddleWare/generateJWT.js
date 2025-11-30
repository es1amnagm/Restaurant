const JWT = require('jsonwebtoken');

const generateJWT = async(payload)=>{
    const token = await JWT.sign(payload, process.env.JWT_SECRET_KEY,{expiresIn:'1d'});
    return token ;
}


module.exports = generateJWT ;