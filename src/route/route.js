const express = require('express');
const router = express.Router();
const {createUser,loginUser,getUser,updateUser} = require('../controller/userController');
const {auth} = require('../middleware/authentication')
const {authrize} = require('../middleware/authrization')

//user api's
router.post('/register',createUser)
router.post('/login',loginUser)
router.get('/user/:userId/profile',auth,authrize,getUser)
router.put('/user/:userId/profile',auth,authrize,updateUser)


module.exports = router;