import Joi from "joi";

export const attachPermissionsSchema = Joi.object({
  permissionIds: Joi.array()
    .items(Joi.number().integer().positive().required())
    .min(1)
    .required()
    .messages({
      "array.min": "At least one permission ID is required",
      "array.base": "Permission IDs must be an array",
      "array.required": "Permission IDs are required",
    }),
});
