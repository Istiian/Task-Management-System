// Middleware factory that validates req.body against a Joi schema.
// Returns 400 with the first validation error message if validation fails.
export const validateForm = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        next();
    };
};
