import { ApiError } from "./error.middleware.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return next(new ApiError(400, `Validation Error: ${errorMessage}`));
    }

    req.body = value;
    return next();
  };
};
