const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCertificate = async (filePath, fileName) => {
  try {
    console.log("======================================");
    console.log("Uploading certificate to Cloudinary...");
    console.log("File:", fileName);
    console.log("======================================");

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "ianetl-2026/certificates",
      public_id: fileName.replace(/\.pdf$/i, ""),
      overwrite: true,
    });

    console.log("Cloudinary upload successful");
    console.log("Cloudinary URL:", result.secure_url);

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:");
    console.error(error);

    throw new Error(
      `Cloudinary upload failed: ${error.message}`
    );
  }
};

module.exports = {
  uploadCertificate,
};