import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: "dghu5zlll",
    api_key:"312446491622852",
    api_secret:"Ih7sOuIRlPIJk_t8ZKDwwiXTDpU"
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // files has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export { uploadOnCloudinary }