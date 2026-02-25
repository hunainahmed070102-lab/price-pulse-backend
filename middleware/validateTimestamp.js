const validateTimestamp = (req, res, next) => {
    // Remove any timestamp fields from request body to prevent client-side manipulation
    const { createdAt, updatedAt, submittedAt, timestamp, ...sanitizedBody } = req.body;
    
    // Check if any timestamp fields were attempted to be sent
    const timestampFields = ['createdAt', 'updatedAt', 'submittedAt', 'timestamp'];
    const foundTimestampFields = timestampFields.filter(field => req.body[field]);
    
    if (foundTimestampFields.length > 0) {
        console.warn(`Timestamp manipulation attempt detected. Fields removed: ${foundTimestampFields.join(', ')}`);
        // Log the attempt for security monitoring
        console.warn('Request origin:', req.ip);
        console.warn('User agent:', req.get('User-Agent'));
    }
    
    // Replace request body with sanitized version
    req.body = sanitizedBody;
    
    next();
};

module.exports = validateTimestamp;
