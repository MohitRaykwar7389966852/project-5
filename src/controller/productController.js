const productModel = require('../model/productModel')
const aws= require("aws-sdk")
const {isValid,isValidBody,isValidObjectId} = require('../validation/validator')

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

 const createProduct = async function(req,res)
{
    try{
            let files = req.files
            let productImage = files[0]
            if(!isValid(productImage)) return res.status(400).send({ status: false, message: "Please Enter Product Image" });
            
            let data =req.body                     
            if(!isValid(data)) return res.status(400).send({ status: false, message: "No Data Found" });

            let {title,description,price,currencyId,currencyFormat,availableSizes,installments} = data

            if(!isValid(title)) return res.status(400).send({ status: false, message: "Please Enter Product Title"});
            const checkTitle = await productModel.findOne({ title: title });
            if (checkTitle) return res.status(400).send({ status: false, message: "Product Title is already register" });

            if(!isValid(description)) return res.status(400).send({ status: false, message: "Please Enter Product Description" });

            if(!isValid(price)) return res.status(400).send({ status: false, message: "Please Enter Product Price" });
            if (!/^[0-9]+$/.test(price)) return res.status(400).send({ status: false, message: "Price should be valid" });

            if(!isValid(currencyId)) return res.status(400).send({ status: false, message: "Please Enter Currency Id" });

            if(!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "Please Enter Currency Format" });
            if(currencyFormat != "Rs." ) return res.status(400).send({ status: false, message: "Please Enter Rupees Currency Format - Rs." });

            if(!isValid(availableSizes)) return res.status(400).send({ status: false, message: "Please Enter Available Sizes" });
            let size = JSON.parse(req.body.availableSizes)
            for(let i=0; i<size.length; i++)
            {
                if(!["S", "XS","M","X", "L","XXL", "XL"].includes(size[i])){
                    return res.status(400).send({ status: false, message: "Please Enter Available Sizes Like - S,XS,M,X,L,XXL,XL" });
                }
            }
            data.availableSizes = size

            if(isValid(installments)){
            if(!/^[0-9]+$/.test(installments)) return res.status(400).send({ status: false, message: "Please Enter Valid Installments" });
            }
            
            let imageUrl = await uploadFile(productImage)
            data.productImage = imageUrl

            let productCreated = await productModel.create(data)
            return res.status(201).send({status:true ,message:"Product created successfully", data:productCreated})
    }
    catch(e)
    {
        res.status(500).send({status:false , message:e.message})
    }
}

const getProduct = async function (req, res) {
    try {
        let data = req.query
        if(!isValid(data)) return  res.status(400).send({ status: false, message: "Please Enter At Least One Query" });
        let {size,name,priceGreaterThan,priceLessThan} = data

        let filter = {"isDeleted":false}

        if(size) filter.availableSizes = size
        if(name) filter.title = name
        if(priceGreaterThan) filter.price = { $gt: priceGreaterThan , $lt: priceLessThan }
        else if(priceGreaterThan) filter.price = { $gt: priceGreaterThan }
        else if(priceLessThan) filter.price = { $lt: priceLessThan }
 
        let findProduct = await productModel.find(filter).sort({price:1})
        if (findProduct.length==0) return res.status(404).send({ status: false, message: "No Product Found" });

        return res.status(200).send({ status: true, message: "Product Results", data: findProduct });

    } catch (e) {
        res.status(500).send({status:false , message:e.message});
    }
  };

  const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if(!isValidObjectId(productId)) return  res.status(400).send({ status: false, message: "Please Enter Valid Product Id" });
       
        let findProduct = await productModel.findOne({isDeleted:false ,_id:productId})
        if (!findProduct) return res.status(404).send({ status: false, message: "No Product Found" });

        return res.status(200).send({ status: true, message: "Product Results", data: findProduct });

    } catch (e) {
        res.status(500).send({status:false , message:e.message});
    }
  };

  const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if(!isValidObjectId(productId)) return  res.status(400).send({ status: false, message: "Please Enter Valid Product Id" });

        let files = req.files
        const data = req.body;
        if(!isValidBody(data) && !isValid(files)) return res.status(400).send({status: false,message: "No data found for updation"});

        let findProduct = await productModel.findOne({isDeleted:false ,_id:productId})
        if (!findProduct) return res.status(404).send({ status: false, message: "No Product Found" });

        let productImage = files[0]
        let {title,price,currencyFormat,availableSizes,installments} =data
        
        let dataKey = Object.keys(data)
        for(let i=0;i<dataKey.length; i++)
        {
            let key = dataKey[i]
            if(data[key] == "")
            {
                return res.status(400).send({ status: false, message: key+" is empty" });
            }
        }

        if(isValid(title)){
            const checkTitle = await productModel.findOne({ title: title });
            if (checkTitle) return res.status(400).send({ status: false, message: "Product Title is already register" });
        }

        if(isValid(price))
        {
            if (!/^[0-9]+$/.test(price)) return res.status(400).send({ status: false, message: "Price should be valid" });
        }
        
        if(isValid(currencyFormat))
        {
            if(currencyFormat != "Rs." ) return res.status(400).send({ status: false, message: "Please Enter Rupees Currency Format - Rs." });
        }
        
        if(isValid(availableSizes)){
            let size = JSON.parse(req.body.availableSizes)
            for(let i=0; i<size.length; i++)
                {
                    if(!["S", "XS","M","X", "L","XXL", "XL"].includes(size[i])){
                        return res.status(400).send({ status: false, message: "Please Enter Available Size Like - S,XS,M,X,L,XXL,XL" });
                    }
                }
            let currentSize = findProduct.availableSizes
            let finalSize = [...new Set([...currentSize,...size])]
            data.availableSizes = finalSize
        }
        
        if(isValid(installments)){
        if(!/^[0-9]+$/.test(installments)) return res.status(400).send({ status: false, message: "Please Enter Valid Installments" });
        }

        if(isValid(productImage))
        {
            let imageUrl = await uploadFile(productImage)
            data.productImage = imageUrl
        }
       
        let updateProduct = await productModel.findOneAndUpdate(
            {_id:productId},
            data,
            {new:true}
        )

        return res.status(200).send({ status: true, message: "Product Updated Successfully" , data:updateProduct });

    } catch (e) {
        res.status(500).send({status:false , message:e.message});
    }
  };


  const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if(!isValidObjectId(productId)) return  res.status(400).send({ status: false, message: "Please Enter Valid Product Id" });
       
        let findProduct = await productModel.findOne({isDeleted:false ,_id:productId})
        if (!findProduct) return res.status(404).send({ status: false, message: "No Product Found" });

        await productModel.findOneAndUpdate(
            {_id:productId},
            {isDeleted:true, deletedAt:new Date()},
        )

        return res.status(200).send({ status: true, message: "Product Deleted Successfully" });

    } catch (e) {
        res.status(500).send({status:false , message:e.message});
    }
  };

module.exports = {createProduct,getProduct,getProductById,updateProduct,deleteProduct}
