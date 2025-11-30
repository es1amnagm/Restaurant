const generateError = (message,statusCode,errorState)=>{
    const error = new Error();
    error.message = message;
    error.statusCode = statusCode;
    error.state = errorState;
    return error
}

module.exports = generateError;