import multer from "multer";
import { Product } from "../../models";
import path from "path";
import { CustomErrorHandler } from "../../services"
import Joi from "joi";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        let uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
        cb(null, uniqueName);
    }
})

const handleMultipartData = multer({ storage, limits: { fileSize: 1000000 * 5 } }).single('image');


const storeController = {
    async store(req, res, next) {
        // multipart form data.
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }
            const filePath = req.file.path;
            // validate request.
            const productSchema = Joi.object({
                name: Joi.string().required(),
                price: Joi.string().required(),
                size: Joi.string().required(),
            })

            const { error } = productSchema.validate(req.body);
            if(error) {
                // delete the stored file.
                fs.unlink(`${appRoot}${filePath}`, err => {
                    return next(CustomErrorHandler.serverError(err.message));
                })  //rootfolder/uplods/filePath.
                
                return next(error)
            }

            const { name, price, size} = req.body;
            let document;
            
            try {
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                })
            } catch (err) {
                return next(err);
            }

            res.status(201).json({ data: document })
        })
    }
}

export default storeController;