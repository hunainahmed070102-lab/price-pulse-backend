const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const validateTimestamp = require('../middleware/validateTimestamp');

// GET all complaints
router.get('/', complaintController.getAllComplaints);

// GET single complaint
router.get('/:id', complaintController.getComplaint);

// GET complaint by complaintId
router.get('/complaintId/:complaintId', complaintController.getComplaintByComplaintId);

// POST create new complaint
router.post('/', validateTimestamp, complaintController.createComplaint);

// PUT update complaint status
router.put('/:id/status', complaintController.updateComplaintStatus);

// DELETE complaint
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;
