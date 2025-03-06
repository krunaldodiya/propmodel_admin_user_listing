import Joi from 'joi';

export const createAdminSchema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    date_of_birth: Joi.date().optional(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    postal_code: Joi.string().optional(),
    town_city: Joi.string().optional(),
    state: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
}); 