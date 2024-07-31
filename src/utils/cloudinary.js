import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from 'dotenv'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

const uploadOnCloudinary = async(locaFilePath) =>{
    try {
        if(!locaFilePath) return null

        const response = await cloudinary.uploader.upload(locaFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(locaFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(locaFilePath)
        return null;
    }
}

export {uploadOnCloudinary}