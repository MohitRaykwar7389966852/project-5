const express = require('express');
const router = express.Router();
const {createUser,loginUser,getUser} = require('../controller/userController');
const {auth} = require('../middleware/authentication')

router.post('/register',createUser)
router.post('/login',loginUser)
router.get('/user/:userId/profile',auth,getUser)


module.exports = router;