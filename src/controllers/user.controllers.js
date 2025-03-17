import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accesstoken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
    
        return {accesstoken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        // Yeh maine isliye likha h kyonki mere paas user ko check krne ke liye do parameter the toh simple or bhi laga skta tha pr maine operator laga ke dono parameter check krliya
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log("This is the avatar local path", avatarLocalPath)

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    console.log("this is the cover image", coverImageLocalPath)
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log("This is the avatar",avatar)
    console.log("This is the coverImage", coverImage)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    console.log("this is the user", user)

    // yahan maine select isliye use kiya h kyonki mujhe select mein woh dena padta h jo mujhe nhi chahiye 
   // jaise maine password ke negative laga diya kyonki mujhe nhi chaiye tha kyonki maine user ko token nhi dena chahta
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler( async (req,res) => {
     // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
    const { email,username,password } = req.body
    if(!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid User credentials")
    }

    const { accesstoken,refreshToken } = await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken", accesstoken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser,accesstoken,refreshToken
        },
        "User Logged In Successfully"
    )
)
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1 // This removes the field from the document
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "User Logged Out"))
})

const refreshToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized Token")
    }

    try {
        const decodeToken = jwt.verify(incomingRefreshToken, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id)
    
        if (!user) {
            throw new ApiError(401,"Invalid refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh Token is expire or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const { accesstoken,newRefreshToken } = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accesstoken", accesstoken,options)
        .cookie("refreshToken", newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accesstoken, refreshToken:newRefreshToken},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const { oldPassword,newPassword } = req.body

    const user = User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old Password")
    }

    user.password = newPassword
    // Yahan maine db ke password ke saath chedkhani kiya h toh mujhe save method bhi lagana padega
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change Successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200,
        req.user, // yeh main aise likh paya ki maine middleware mein maine req.user mein user daal diya tha aur woh user loggedIn tha
        "User fetched Successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const { fullName,email } = req.body

    if(!fullName || !email) {
        throw new ApiError(400, "All fields are mandatory")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, // Hm yahan fullName ko fullName:fullName ko aise bhi likh ke bhej skte the hamare pss kayi saare options are object mein naya data daalne ke liye
                email:email
            }
        },
        { new:true } // new true isliye likha h kyonki jo maine fullname aur email change kiya h woh naya mtlb updated wala jaaye purana wala naa jaye 
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated Successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const { avatarLocalPath } = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading Avatar")
    }

    const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"))
})

const updateCoverImage = asyncHandler(async(req,res) => {
    const { coverImageLocalPath } = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is Missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading the CoverImage")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")
    return res.status(200)
    .json(new ApiResponse(200, "Cover Image Uploaded Successfully"))
})

export { registerUser,loginUser,logoutUser,refreshToken,changeCurrentPassword,updateUserAvatar,updateCoverImage }