const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        trim:true,
        required: true
    },
    lname: {
        type: String,
        trim:true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim:true,
    },
    profileImage: {
        type:String,
        trim:true,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    address: {
        shipping: {
          street: {type:String, required:true},
          city: {type:String, required:true},
          pincode: {type:Number, required:true}
        },
        billing: {
            street: {type:String, required:true},
            city: {type:String, required:true},
            pincode: {type:Number, required:true}
        }
    }

},{timestamps: true });

module.exports = mongoose.model('User',userSchema)