const jwt = require('jsonwebtoken')

const auth = async function(req,res,next){
    try{
        let bearerHeader = req.headers['authorization']
        if(!bearerHeader) return res.status(400).send({status:false , message:"Token is not available"})
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1]
        //if(!bearerToken) return res.status(400).send({status:false , message:"token is not available"})
        
        jwt.verify(bearerToken, "Project5")
        next()
    }
    catch(e)
    {
        res.status(500).send({status:false , message:e.message});
    }
}

module.exports = {auth}