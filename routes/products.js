const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req,res) =>{

    // filtering
    let filter = {};
    if(req.query.categories){
        filter = {category:req.query.categories.split(',')};
    }

    const productList = await Product.find(filter)
    .populate('category');

    if(!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList);
});

router.get(`/:id`, async (req,res) =>{
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});

router.post(`/`, async (req,res) =>{

    // ambil colection category
    const category = await Category.findById(req.body.category);
    // jika tidak ada category
    if(!category) return res.status(400).send('invalid category')

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category, // referensi catgory collection
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save();
    
    if(!product)
    return res.status(500).send('the product cannot be created');
    res.send(product);
});

router.put('/:id', async (req,res) =>{

    //jika id tidak valid
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid product id');
    }

     // ambil colection category
     const category = await Category.findById(req.body.category);
     // jika tidak ada category
     if(!category) return res.status(400).send('invalid category')

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category, // referensi catgory collection
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured

        }, { new: true }
    )

    if(!product)
    {
        return res.status(500).send('the product cannot be update');
    }
    res.send(product); 

})

router.delete('/:id',(req, res) =>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product){
            return res.status(200).json({ success: true, message: 'the product is deleted'});
        } else{
            return res.status(404).json({success: false, message: 'product not found'});
        }
    }).catch(err=>{
        return res.status(400).json({ success: false, error: err });
    })
})
// tampilkan jumlah dokumen
router.get(`/get/count`, async (req,res) =>{
    const productCount = await Product.countDocuments((count) => count);

    if(!productCount) {
        res.status(500).json({ success: false });
    }
    productCount: productCount
});

// menampilkan feature
router.get(`/get/featured/:count`, async (req,res) =>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if(!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});

module.exports = router;