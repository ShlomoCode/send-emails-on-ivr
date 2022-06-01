module.exports = (req, res, next) => {
    if (!process.env.IVR_TOKEN) {
        return next();
    }

    if (!req.query.token) {
        return res.status(401).json({
            message: 'Unauthorized - token required'
        });
    }

    if (req.query.token !== process.env.IVR_TOKEN) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    next();
};