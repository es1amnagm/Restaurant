module.exports= (res,statusCode,statusText,data)=>{
  return res.status(statusCode).json({status:statusText,data:data})
}
