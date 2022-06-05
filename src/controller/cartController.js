const cartModel = require('../model/cartModel')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const { isValid, isValidBody, isValidObjectId } = require('../validation/validator')

const createCart = async function (req, res) {
    try {
        const data = req.body
        const userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "this userId is not valid" })
        let findUser = await userModel.findOne({_id:userId})
        if(!findUser) return res.status(400).send({ status: false, msg: "this userId is not exist in record" })

        if(!isValidBody(data)) return res.status(400).send({ status: false, message:"No Data Found" })

        data.userId = userId
        let { items , cartId } = data
        
        if (!isValid(items)) return res.status(400).send({ status: false, msg: "plz enter valid product details" })
        let productId = items[0].productId
        let quantity = items[0].quantity

        if (!isValid(quantity)) return res.status(400).send({ status: false, msg: "Give at least one item" })
        if (!/^[0-9]+$/.test(quantity)) return res.status(400).send({ status: false, message: "Quantity should be valid" });
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "this productId is not valid" })

        let ifProductExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!ifProductExist) return res.status(404).send({ status: false, msg: "this product is not in our records" })

        let addCart
        
        if(isValid(cartId)) {
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, msg: "this cartId is not valid" })
            let findCart = await cartModel.findOne({ _id: cartId , userId:userId })
            if(!findCart) return res.status(400).send({ status: false, msg: "no cart exist" })

            let arr = findCart.items
            let c = 0
            let TI
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    arr[i].quantity += quantity
                    TI = findCart.totalItems
                    c++
                    break;
                }
            }
            if (c == 0) {
                arr.push(items[0])
                TI = findCart.totalItems + 1
            }
            
            let TP = (ifProductExist.price * quantity) + findCart.totalPrice
            addCart = await cartModel.findOneAndUpdate(
                { _id: findCart._id },
                { totalItems: TI, totalPrice: TP, items: arr },
                { new: true }
            )
        }
        else {
            data.totalItems = items.length
            data.totalPrice = ifProductExist.price * quantity
            addCart = await cartModel.create(data)
        }
        return res.status(201).send({ status: true, message: "Cart Created Successfully", data: addCart })
    } catch (e) {
        res.status(500).send({ status: false, message: e.message });
    }
}

const updateCart = async function (req, res) {
    try {
        const data = req.body
        const userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "this userId is not valid" })
        let findUser = await userModel.findOne({_id:userId})
        if(!findUser) return res.status(400).send({ status: false, msg: "this userId is not exist in record" })

        if(!isValidBody(data)) return res.status(400).send({ status: false, message:"No Data Found For Updation" })

        let {productId, removeProduct } = data

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "this productId is not valid" })
        let ifProductExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!ifProductExist) return res.status(404).send({ status: false, msg: "this product is not in our records" })

        if (!isValid(removeProduct)) return res.status(400).send({ status: false, msg: "Please Enter removeProduct" })
        if (!/^[0-9]+$/.test(removeProduct)) return res.status(400).send({ status: false, message: "Remove Product should be number" });


        let findCart = await cartModel.findOne({ userId: userId })
        if (!findCart) return res.status(400).send({ status: false, message: "No Cart Found" });

            let arr = findCart.items
            let c = 0
            let TI
            let TP
            if(removeProduct !=0)
            {
            for (let i=0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    if(arr[i].quantity < removeProduct) return res.status(400).send({ status: false, message: "Remove Product Value More Than Total Product Added In Cart" });
                    arr[i].quantity -= removeProduct
                    if(arr[i].quantity==0){
                        arr.splice(i, 1);
                    }
                    c++
                    break;
                }
            }
            if (c == 0) return res.status(400).send({ status: false, message: "No Cart Exist With This Product Id" });
            
              TI = arr.length
              TP = findCart.totalPrice - (ifProductExist.price * removeProduct)
            }
            else
            {
                TI = 0
                TP=0
                arr = []
            }
            let addCart = await cartModel.findOneAndUpdate(
                { _id: findCart._id },
                { totalItems: TI, totalPrice: TP, items: arr },
                { new: true }
            )

        return res.status(200).send({ status: true, message: "Cart Updated Successfully", data: addCart })
    } catch (e) {
        res.status(500).send({ status: false, message: e.message });
    }
}

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "this userId is not valid" })

        let findUser = await userModel.findOne({_id:userId})
        if(!findUser) return res.status(400).send({ status: false, msg: "this userId is not exist in record" })

        let findCart = await cartModel.findOne({ userId: userId })
        if (!findCart) return res.status(400).send({ status: false, message: "No Cart Found" });

        return res.status(200).send({ status: true, message: "Cart Found Successfully", data: findCart })
    } catch (e) {
        res.status(500).send({ status: false, message: e.message });
    }
}

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "this userId is not valid" })

        let findUser = await userModel.findOne({_id:userId})
        if(!findUser) return res.status(400).send({ status: false, msg: "this userId is not exist in record" })

        let findCart = await cartModel.findOne({ userId: userId })
        if (!findCart) return res.status(400).send({ status: false, message: "No Cart Found" });

        item =[]
        await cartModel.findOneAndUpdate(
            {userId:userId},
            {totalItems:0 , totalPrice:0,items:item},
            {new:true}
        )

        return res.status(204).send({ status: true, message: "Cart Deleted Successfully"})
    } catch (e) {
        res.status(500).send({ status: false, message: e.message });
    }
}


module.exports = { createCart, updateCart , getCart, deleteCart }