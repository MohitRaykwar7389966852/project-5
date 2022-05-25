const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const {isValidObjectId} = require('../validation/validator')

const authrize = async function(req,res,next){
    try{
        let bearerHeader = req.headers['authorization']
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1]
        let decodeToken = jwt.decode(bearerToken)

        let userId = req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).send({status:false , message:"Please Enter Valid User Id"})
        
        if(userId != decodeToken.userId ) return res.status(403).send({status:false , message:"user is not authorized"})
        next()
    }
    catch(e)
    {
        res.status(500).send({status:false , message:e.message});
    }
}

module.exports = {authrize}