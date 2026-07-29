import cloudinary from "../../config/cloudinary.js";

export const uploadImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }

        const uploadStream = () =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "HackSphere",
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }

                        resolve(result);
                    }
                );

                stream.end(req.file.buffer);
            });

        const result = await uploadStream();

        return res.status(200).json({
            success: true,
            url: result.secure_url,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload image",
        });
    }
};