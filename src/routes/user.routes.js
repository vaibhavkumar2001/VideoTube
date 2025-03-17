import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

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

export default router