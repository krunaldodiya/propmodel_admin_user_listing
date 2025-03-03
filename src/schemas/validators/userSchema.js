import Joi from "joi";

export const userIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  first_name: Joi.string().min(2).max(50).optional(),
  last_name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  status: Joi.number().integer().valid(0, 1, 2).optional(),
}).min(1).messages({
  "object.min": "At least one field must be provided for update",
  "string.email": "Invalid email format",
  "string.min": "First name and last name must be at least 2 characters long",
  "string.max": "First name and last name must not exceed 50 characters",
  "number.base": "Status must be a number",
  "number.integer": "Status must be an integer",
  "any.only": "Status must be 0, 1, or 2"
}); 