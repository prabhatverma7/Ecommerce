const express = require('express');
const { 
    createUser,
    loginUserCtrl,
    getallUser, 
    getaUser, 
    deleteaUser,
    updateaUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword
} = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register',createUser);
router.put('/password', authMiddleware, updatePassword);
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);
router.post('/login',loginUserCtrl);
router.get('/all-Users',getallUser);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.delete('/:id',deleteaUser);
router.put('/edit-user', authMiddleware, updateaUser);
router.put('/block-user/:id', authMiddleware,isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware,isAdmin, unblockUser);

module.exports = router;