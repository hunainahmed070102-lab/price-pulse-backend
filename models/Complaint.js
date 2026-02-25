const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    complaintId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    complaintTable: {
        type: String,
        required: true,
        enum: ['price', 'quality', 'service', 'other'],
        default: 'price'
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    shopName: {
        type: String,
        required: true,
        trim: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    issue: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'resolved', 'rejected'],
        default: 'pending'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['pending', 'processing', 'resolved', 'rejected'],
            required: true
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
