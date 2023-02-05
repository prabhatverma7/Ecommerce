const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../configs/jwttoken');
const { validateMongoDbId } = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../configs/refreshtoken');



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
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
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

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error(" No Refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    });

});

// logout
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) {
        res.clearCookie("refreshToken", {
            httpOnly:true,
            secure:true
        });
        res.status(204); // forbidden
    }
    await User.findOneAndUpdate(refreshToken,{
        refreshToken:"",

    });
    res.clearCookie("refreshToken", {
        httpOnly:true,
        secure:true
    });
    res.sendStatus(204); // forbidden
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
        const { id } = req.params;
        validateMongoDbId(id);
        const getUser = await User.findById(id);
        res.json(getUser);
    } catch (ex) {
        throw new Error(ex)
    }
});

const deleteaUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const deleteUser = await User.findByIdAndDelete(id);
        res.json(deleteUser);
    } catch (ex) {
        throw new Error(ex)
    }
});

const updateaUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user;
        validateMongoDbId(id);
        const deleteUser = await User.findByIdAndUpdate(id, {
            $set: {
                firstname: req?.body?.firstname,
                lastname: req?.body?.lastname,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            }
        }, { new: true });
        res.json(deleteUser);
    } catch (ex) {
        throw new Error(ex)
    }
});

const blockUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const block = await User.findByIdAndUpdate(id, {
            $set: {
                isBlocked: true
            }
        },
            {
                new: true
            });
        res.json({
            message: "User Blocked"
        });
    } catch (ex) {
        throw new Error(ex)
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);
        const unblock = await User.findByIdAndUpdate(id, {
            $set: {
                isBlocked: false
            }
        },
            {
                new: true
            });

        res.json({
            message: "User Unblocked"
        });
    } catch (ex) {
        throw new Error(ex)
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json(user);
    }
  });
  
  const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    try {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
      const data = {
        to: email,
        text: "Hey User",
        subject: "Forgot Password Link",
        htm: resetURL,
      };
      sendEmail(data);
      res.json(token);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error(" Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
  });



module.exports = {
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
};