import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshToken, 
    registerUser, 
    updateAccountDetails, 
    updateCoverImage, 
    updateUserAvatar
} from "../controllers/user.controllers.js";

// Yahan maine upload.fields isliye likha h kyonki file directly access nhi ho skta isilye usko routes mein likhna padega middleware ki tarah 
router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

//secured Routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-Token').post(refreshToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router