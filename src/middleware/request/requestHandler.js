/**
 * Generic request validation handler
 * @param {Object} schema - Joi schema to validate against
 * @param {string} property - Request property to validate (body, query, params)
 */
export const requestHandler = (schema, property = "body") => {
  return async (req, res, next) => {
    try {
      req[property] = await schema.validateAsync(req[property], {
        abortEarly: false,
        stripUnknown: true,
      });
      next();
    } catch (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      res.error(errors[0].message, 400, errors);
    }
  };
};
