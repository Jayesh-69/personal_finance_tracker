const { Category } = require('../models');

exports.getBatch = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
}

exports.insertOne = async (req, res) => {
    try {
        const { name, type, subcategory } = req.body;
        if (!name || !type) return res.status(400).json({ success: false, message: 'Name and type are required' });

        const category = await Category.create({ name, type, subcategory });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating category' });
    }
}