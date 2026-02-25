const Complaint = require('../models/Complaint');

// Get all complaints
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: complaints
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single complaint by ID
exports.getComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }
        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get complaint by complaintId
exports.getComplaintByComplaintId = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }
        res.json({ success: true, data: complaint });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Create new complaint
exports.createComplaint = async (req, res) => {
    try {
        const { customerName, phoneNumber, shopName, productName, location, issue, complaintTable } = req.body;

        // Validation
        if (!customerName || !phoneNumber || !shopName || !productName || !location || !issue) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Generate unique complaint ID with server timestamp
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const random = Math.floor(100 + Math.random() * 900);
        const complaintId = `COMP${year}${month}${day}${hours}${minutes}${seconds}${random}`;

        // Server-side timestamp to prevent fake reporting
        const serverTimestamp = now;

        const complaint = new Complaint({
            complaintId,
            complaintTable: complaintTable || 'price',
            customerName,
            phoneNumber,
            shopName,
            productName,
            location,
            issue,
            createdAt: serverTimestamp, // Explicitly set server timestamp
            updatedAt: serverTimestamp,
            statusHistory: [{
                status: 'pending',
                timestamp: serverTimestamp
            }]
        });

        await complaint.save();

        res.status(201).json({
            success: true,
            data: complaint,
            message: 'Complaint submitted successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                error: 'Duplicate complaint ID generated. Please try again.'
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log('Update Status Request:', { id, status });

        if (!['pending', 'processing', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: 'Complaint not found'
            });
        }

        console.log('Current complaint status:', complaint.status);
        console.log('Current statusHistory:', complaint.statusHistory);

        // Initialize statusHistory if it doesn't exist (for old complaints)
        if (!complaint.statusHistory || complaint.statusHistory.length === 0) {
            complaint.statusHistory = [{
                status: complaint.status,
                timestamp: complaint.createdAt || new Date()
            }];
        }

        // Only update if status is actually changing
        if (complaint.status !== status) {
            const now = new Date();
            
            // Define status progression order
            const statusOrder = ['pending', 'processing', 'resolved', 'rejected'];
            const currentIndex = statusOrder.indexOf(complaint.status);
            const newIndex = statusOrder.indexOf(status);
            
            // If moving backward or to rejected, remove future statuses from history
            if (newIndex < currentIndex || status === 'rejected') {
                // Keep only statuses up to the new status
                complaint.statusHistory = complaint.statusHistory.filter(h => {
                    const hIndex = statusOrder.indexOf(h.status);
                    return hIndex <= newIndex;
                });
            }
            
            // Check if this status already exists in history
            const existingStatusIndex = complaint.statusHistory.findIndex(h => h.status === status);
            
            if (existingStatusIndex >= 0) {
                // Update the timestamp of existing status
                complaint.statusHistory[existingStatusIndex].timestamp = now;
            } else {
                // Add new status to history
                complaint.statusHistory.push({
                    status: status,
                    timestamp: now
                });
            }
            
            complaint.status = status;
            await complaint.save();
            console.log('✅ Status updated successfully');
            console.log('New statusHistory:', complaint.statusHistory);
        } else {
            console.log('⚠️ Status unchanged, no update needed');
        }

        res.json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('❌ Error updating complaint status:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete complaint
exports.deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findByIdAndDelete(id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: 'Complaint not found'
            });
        }

        res.json({
            success: true,
            message: 'Complaint deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
