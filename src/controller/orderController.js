const orderModel = require('../model/orderModel')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const cartModel = require('../model/cartModel')
const { isValid, isValidBody, isValidObjectId } = require('../validation/validator')

const createOrder = async function(req,res) {
    try{
        const body = req.body
        const userId = req.params.userId
        if(!isValidBody(body)) return res.status(400).send({ status: false, message:"No Data Found" })

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "this userId is not valid" })
        let findUser = await userModel.findOne({_id:userId})
        if(!findUser) return res.status(400).send({ status: false, msg: "this userId is not exist in record" })

        let {cartId, cancellable, status} = body

        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, msg: "this cartId is not valid" })
        let findCart = await cartModel.findOne({_id:cartId})
        if(!findCart) return res.status(400).send({ status: false, msg: "this cartId is not exist in record" })

        
        let order = { userId: userId, items: findCart.items, totalPrice: findCart.totalPrice, totalItems: findCart.totalItems}

        if (isValid(cancellable)) {
            if (!(typeof (cancellable) == 'boolean')) return res.status(400).send({ status: false, message: "Cancellable must be a boolean value" });
            order.cancellable = cancellable 
        }

        if(isValid(status)) {
            if (['pending', 'completed', 'cancelled'].indexOf(status)==-1) return res.status(400).send({status: false, message: "Order status by default is pending"})
            order.status = status
        }

        let totalQuantity = 0

        let itemsArr = findCart.items
        for (let i in itemsArr) {
            totalQuantity += itemsArr[i].quantity
        }
        order.totalQuantity = totalQuantity

        let createdOrder = await orderModel.create(order)
        return res.status(201).send({status: true, message: "Successfully created Order", data: createdOrder})
    }
    catch (error) {
        res.status(500).send({ stats:false, error: error.message })
    }
}

const updateOrder =async function(req,res) {
    try{
        const userId = req.params.userId;
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "this userId is not valid" })
        let findUser = await userModel.findOne({_id:userId})
        if(!findUser) return res.status(400).send({ status: false, msg: "this userId is not exist in record" })

        const body = req.body
        if(!isValidBody(body)) return res.status(400).send({ status: false, message:"No Data Found" })

        let {orderId, status} = body

        if(!isValid(orderId)) return res.status(400).send({status: false, message: "orderId is required"})
        if(!isValidObjectId(orderId)) return res.status(400).send({status: false, message: "Invalid orderId"})
        const orderSearch = await orderModel.findOne({_id: orderId,isDeleted:false})
        if(!orderSearch) return res.status(400).send({status: false, message: "order does not exist"})

        const userSearchInOrder = await orderModel.findOne({_id:orderId,userId:userId})
        if(!userSearchInOrder) {
            return res.status(400).send({status: false, message: "this is not valid order id for this user"})
        }

        if(!isValid(status)) return res.status(400).send({status: false, message: "status is required"})
        if(["completed","cancelled"].indexOf(status)==-1) return res.status(400).send({status: false, message: "status should be cancelled or completed"})

        
        if(orderSearch.cancellable == false && status == "cancelled") {
            return res.status(400).send({status: false, message: "Order is not cancellable"})
        }


        if((orderSearch.status) == "completed" && status == "completed") {
            return res.status(400).send({status: false, message: "Order is already completed,can't be updated"})
        } 

        let updatedData = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })
        await cartModel.findOneAndUpdate({userId:userId}, {items:[], totalItems:0, totalPrice:0}, {new: true})
        return res.status(200).send({ status: false, message: "Order Updated Successfully", data: updatedData });
    }
    catch (error) {
        res.status(500).send({ status:false, error: error.message })
    }
}

module.exports = { createOrder,updateOrder }


 