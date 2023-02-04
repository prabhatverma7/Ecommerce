const express = require('express');
const { createUser,
    loginUserCtrl,
    getallUser, 
    getaUser, 
    deleteaUser,
    updateaUser} = require('../controller/userCtrl');
const router = express.Router();

router.post('/register',createUser);
router.post('/login',loginUserCtrl);
router.get('/all-Users',getallUser);
router.get('/:id',getaUser);
router.delete('/:id',deleteaUser);
router.put('/:id',updateaUser);
module.exports = router;