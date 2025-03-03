import Joi from "joi";

export const createPermissionSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  description: Joi.string().max(200),
});

export const permissionIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const updatePermissionSchema = Joi.object({
  description: Joi.string().max(200),
}).min(1);
