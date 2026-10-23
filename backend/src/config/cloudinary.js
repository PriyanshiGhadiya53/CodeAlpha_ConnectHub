import { v2 as cloudinary } from "cloudinary";

console.log("Cloudinary env check:", {
    cloudNameExists: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKeyExists: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecretExists: Boolean(process.env.CLOUDINARY_API_SECRET)
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;