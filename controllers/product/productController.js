import { Product } from "../../models";
import multer from "multer";
import path from "path";
import { CustomErrorHandler } from "../../services";
import { productSchema } from "../../validators";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        let uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
        cb(null, uniqueName);
    }
})

const handleMultipartData = multer({ storage, limits: { fileSize: 1000000 * 5 } }).single('image');


const productController = {
    async store(req, res, next) {
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError());
            }

            const filePath = req.file.path;

            const { error } = productSchema.validate(req.body);
            if (error) {
                // Delete the uploaded file
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if (err) {
                        return next(CustomErrorHandler.serverError(err.message));
                    }
                })

                return next(error);
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                });

            } catch (error) {
                return next(error);
            }

            res.status(201).json(document);
        })
    },
    // Update product
    async update(req, res, next) {
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError());
            }

            let filePath;
            if (req.file) {
                filePath = req.file.path;
            }

            const { error } = productSchema.validate(req.body);
            if (error) {
                // Delete the uploaded file
                if (req.file) {
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err) {
                            return next(CustomErrorHandler.serverError(err.message));
                        }
                    })
                }

                return next(error);
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await Product.findOneAndUpdate({ _id: req.params.id }, {
                    name,
                    price,
                    size,
                    ...(req.file && { image: filePath })
                }, { new: true });
                console.log(document);
            } catch (error) {
                return next(error);
            }

            res.status(201).json(document);
        })
    },
    // delete product
    async destroy(req, res, next) {
        const document = await Product.findOneAndRemove({ _id: req.params.id });
        if (!document) {
            return next(new Error("nothing to delete"))
        }
        // delete the image
        const imagePath = document._doc.image;
        // without _doc keyword
        // http://localhost:4000/uploads\\1654593420303-225090098.jpg
        console.log(imagePath);
        fs.unlink(`${appRoot}/${imagePath}`, (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError());
            }
        })

        res.json(document);
    },
    // get all products
    async index(req, res, next) {
        let documents;
        try {
            documents = await Product.find().select('-__v').sort({ _id: -1 })
            // for pagination -> mongoose pagination
        } catch (error) {
            return next(error);
        }

        res.json(documents);
    },
    // get single product
    async show(req, res, next) {
        let document;
        try {
            document = await Product.findById({ _id: req.params.id }).select('-__v');
        } catch (error) {
            return next(error);
        }

        res.json(document);
    },

    async cart(req, res, next) {
        let document;
        let items;
        let ids = req.params.ids;
        // try {
        //     document = Product.find({_id: ids})
        // } catch (error) {
        //     return next(error);
        // }
        // OR
        ids.map(async (id) => {
            await items.push(Product.findById({ _id: id }))
        })
        res.status(201).json({items});
    }

}

export default productController;