const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['fruit', 'vegetable', 'grocery', 'dairy', 'meat', 'tailor', 'street food', 'barber'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        enum: ['kg', 'gram', 'liter', 'ml', 'piece', 'dozen', 'pack', 'bundle', 'meter'],
        default: 'kg'
    },
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Product', productSchema);