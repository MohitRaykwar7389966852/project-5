const jwt = require('jsonwebtoken')

const auth = async function(req,res,next){
    try{
        let header = req.headers
        if(!header.hasOwnProperty('x-api-key')) return res.status(400).send({status:false , message:"token is not found"})
        let token = req.headers['x-api-key']
        if(!token) return res.status(400).send({status:false , message:"token value is empty"})
        
        jwt.verify(token, "Project5")
        next()
    }
    catch(e)
    {
        res.status(500).send({status:false , message:e.message});
    }
}

module.exports = {auth}