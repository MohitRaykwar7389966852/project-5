const userModel = require('../model/userModel')
const aws= require("aws-sdk")
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async (file) =>{
    return new Promise( function(resolve, reject) {
     let s3 = new aws.S3({apiVersion: '2006-03-01'});

     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",
         Key: file.originalname,
         Body: file.buffer
     }
    
     s3.upload( uploadParams, function (err, data ){
         if(err) return reject({"error": err})
         return resolve(data.Location)
     })
    })
 }

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };

  const isValidBody = function(value){
    if(Object.keys(value).length == 0) return false
    return true
  }

  const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
  };

const createUser = async function(req,res)
{
    try{
            let files = req.files
            let profileImage = files[0]
            if(!isValid(profileImage)) return res.status(400).send({ status: false, message: "Please Enter Profile Image" });
            
            let data =req.body.data
            if(!isValid(data)) return res.status(400).send({ status: false, message: "No Data Found" });
            
            let input = JSON.parse(data)

            let {fname,lname,email,phone,password,address} = input

            if(!isValid(fname)) return res.status(400).send({ status: false, message: "Please Enter First Name" });
            if(!isValid(lname)) return res.status(400).send({ status: false, message: "Please Enter Last Name" });

            if(!isValid(email)) return res.status(400).send({ status: false, message: "Please Enter Email" });
            const checkEmail = await userModel.findOne({ email: email });
            if (checkEmail) return res.status(400).send({ status: false, message: "Email is already register" });
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) return res.status(400).send({ status: false, message: "Email should be valid" });
            
            if(!isValid(phone)) return res.status(400).send({ status: false, message: "Please Enter Phone Number" });
            const checkPhone = await userModel.findOne({ phone: phone });
            if (checkPhone) return res.status(400).send({status: false,message: "Mobile number is already registered",});
            if (!/^\d{10}$/.test(phone)) return res.status(400).send({ status: false, message: "Mobile no should be valid" });

            if(!isValid(password)) return res.status(400).send({ status: false, message: "Please Enter Password" });
            if (password.length < 8 || password.length > 15) return res.status(400).send({status: false,message: "password length should be in the range of 8 to 15 only",});
            
            let hashPass = bcrypt.hashSync(password, 10);
            input.password = hashPass

            // if(!isValid(address.shipping)) return res.status(400).send({ status: false, message: "Please Enter Shipping Address" });
            // if(!isValid(address.billing)) return res.status(400).send({ status: false, message: "Please Enter billing Address" });

            let imageUrl = await uploadFile(profileImage)
            input.profileImage = imageUrl

            let userCreated = await userModel.create(input)
            return res.status(201).send({status:true ,message:"User created successfully", data:userCreated})
    }
    catch(e)
    {
        res.status(500).send({status:false , message:e.message})
    }
}

const loginUser = async function (req, res) {
    try {
      const data = req.body;
      if(!isValidBody(data)) return res.status(400).send({status: false,message: "Please Enter Login Credentials",});
      
      const { email, password } = data;
      if (!isValid(email)) return res.status(400).send({ status: false, message: "Please Enter Email" });
      if (!isValid(password)) return res.status(400).send({ status: false, message: "Please Enter Password" });
      
      let findUser = await userModel.findOne({email: email});
      if (!findUser) return res.status(400).send({ status: false, message: "Email is not correct" });
      let checkPass = bcrypt.compareSync(password,findUser.password);
      if (!checkPass) return res.status(400).send({ status: false, message: "Password is not correct" });
  
      let token = jwt.sign(
        {
          userId: findUser._id.toString(),
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
        },
        "Project5"
      );

      let output = {
          userId:findUser._id,
          token:token
        }

      res.header("x-api-key", token);
      return res.status(200).send({ status: true, message: "User login successfull", data: output });
    
    } catch (e) {
        res.status(500).send({status:false , message:e.message});
    }
  };

  const getUser = async function (req, res) {
    try {
        let token = req.headers['x-api-key']
        let decodeToken = jwt.decode(token)

        let userId = req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).send({status:false , message:"Please Enter Valid User Id"})
        
        if(userId != decodeToken.userId ) return res.status(403).send({status:false , message:"user is not authorized"})

        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, message: "User not found" });

        return res.status(200).send({ status: true, message: "User profile details", data: findUser });

    } catch (e) {
        res.status(500).send({status:false , message:e.message});
    }
  };

module.exports = {createUser,loginUser,getUser}