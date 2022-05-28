const express = require('express');
const router = express.Router();
const {createUser,loginUser,getUser,updateUser} = require('../controller/userController');
const {createProduct,getProduct,getProductById,updateProduct,deleteProduct} = require('../controller/productController');
const {createCart,updateCart,getCart} = require('../controller/cartController');
const {auth} = require('../middleware/authentication')
const {authrize} = require('../middleware/authrization')

//user api's
router.post('/register',createUser)
router.post('/login',loginUser)
router.get('/user/:userId/profile',auth,authrize,getUser)
router.put('/user/:userId/profile',auth,authrize,updateUser)

//product api's
router.post('/products',createProduct)
router.get('/products',getProduct)
router.get('/products/:productId',getProductById)
router.put('/products/:productId',updateProduct)
router.delete('/products/:productId',deleteProduct)

//cart api's
router.post('/users/:userId/cart',auth,authrize,createCart)
router.put('/users/:userId/cart',auth,authrize,updateCart)
router.get('/users/:userId/cart',auth,authrize,getCart)

module.exports = router;