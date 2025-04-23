import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = async (req, res, next) => {
  try {
    const { fullname, username, password, usertype, phoneNumber, email } = req.body;

    if ([fullname, username, password, usertype, phoneNumber].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All required fields must be filled");
    }

    const existedUser = await User.findOne({ username });
    if (existedUser) {
      throw new ApiError(409, "User with username already exists");
    }

    const user = await User.create({
      fullname,
      username,
      password,
      usertype,
      phoneNumber,
      email, // Optional field
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json({
      statusCode: 200,
      data: createdUser,
      message: "User registered successfully",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const verifyUser = async (req, res) => {
  try {
    const { userId } = req.body; // Retrieve userId from the request body
    console.log("userId in verify user: ", userId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { verified: true },
      { new: true } // returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User verified successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res, next) => {
    try {
        const { usertype } = req.body;
        const users = await User.find({ usertype }).select("-password -refreshToken");
        console.log(users);
        if (!users) {
            throw new ApiError(404, "No users found");
        }
        return res.status(200).json({
            statusCode: 200,
            data: users,
            message: "Users fetched successfully"
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        console.log(req.body);

        if ([username, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const existedUser = await User.findOne({ username });
        if (!existedUser) {
            throw new ApiError(404, "User not found");
        }

        // Check if the user is verified
        if (!existedUser.verified) {
            throw new ApiError(403, "Verification pending");
        }

        const isMatch = await existedUser.comparePassword(password);
        if (!isMatch) {
            throw new ApiError(401, "Invalid credentials");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(existedUser._id);

        const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        };

        console.log('Response Status Code:', res.statusCode);
        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({
                statusCode: 200,
                data: loggedInUser,
                accessToken,
                refreshToken,
                message: "User logged in successfully",
            });

    } catch (err) {
        console.log(err);
        next(err);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 // this removes the field from document
                }
            },
            {
                new: true
            }
        )
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            {
                statusCode: 200,
                data: null,
                message: "User logged Out"
            }
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")  
    }
};

const refreshAccessToken = async (req, res,next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?.id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            {
                statusCode: 200,
                data: {accessToken, refreshToken: newRefreshToken},
                message: "Access token refreshed"
            })
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

};

const getCurrentUser = async(req, res,next) => {
    return res
    .status(200)
    .json({
        statusCode: 200,
        data: req.user,
        message: "User fetched successfully"
})
};

const deleteUser = async (req, res) => {
    try {
      const { userId } = req.body;
      const result = await User.findByIdAndDelete(userId);
      if (!result) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };

export { registerUser,loginUser,logoutUser, refreshAccessToken, getCurrentUser, verifyUser, getAllUsers, deleteUser };
