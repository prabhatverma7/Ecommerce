const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../configs/jwttoken');

const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error("User Already Exists");
    }

});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        res.json({
            _id: findUser._id,
            firstname: findUser.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            role: findUser?.role,
            token: await generateToken(findUser?._id)
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});

const getallUser = asyncHandler(async (req, res) => {
    try {
        const getallUser = await User.find();
        res.json(getallUser);
    } catch (ex) {
        throw new Error(ex)
    }
});

const getaUser = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const getUser = await User.findById(id);
        res.json(getUser);
    } catch (ex) {
        throw new Error(ex)
    }
});

const deleteaUser = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const deleteUser = await User.findByIdAndDelete(id);
        res.json(deleteUser);
    } catch (ex) {
        throw new Error(ex)
    }
});

const updateaUser = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const deleteUser = await User.findByIdAndUpdate(id,{
            $set:{
                firstname:req?.body?.firstname,
                lastname:req?.body?.lastname,
                email:req?.body?.email,
                mobile:req?.body?.mobile,
            }
        },{ returnOriginal: false });
        res.json(deleteUser);
    } catch (ex) {
        throw new Error(ex)
    }
});

module.exports = { createUser, loginUserCtrl, getallUser,getaUser,deleteaUser,updateaUser };