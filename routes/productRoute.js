const express = require('express');
const { 
    createProduct, 
    getaProduct, 
    getAllProduct,
    updateProduct,
    deleteProduct
} = require('../controller/productCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/',  getAllProduct);
router.get('/:id', getaProduct);
router.post('/',authMiddleware, isAdmin,createProduct);
router.put('/:id',authMiddleware,isAdmin,updateProduct);
router.delete('/:id',isAdmin,deleteProduct);

module.exports = router;