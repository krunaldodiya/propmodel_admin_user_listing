import Joi from "joi";

export const createRoleSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  description: Joi.string().max(200),
});

export const roleIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const updateRoleSchema = Joi.object({
  description: Joi.string().max(200),
}).min(1);
