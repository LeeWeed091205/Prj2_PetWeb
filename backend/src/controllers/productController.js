import { Product } from '../models/index.js';

// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('seller', 'username profile.avatar')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a product
export const createProduct = async (req, res) => {
    try {
        const { title, description, price, images } = req.body;

        const product = new Product({
            seller: req.user._id,
            title,
            description,
            price,
            images: images || [],
        });

        const createdProduct = await product.save();
        await createdProduct.populate('seller', 'username profile.avatar');

        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the seller or admin
        if (
            product.seller.toString() !== req.user._id.toString() &&
            req.user.role !== 'ADMIN'
        ) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await Product.deleteOne({ _id: product._id });

        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
