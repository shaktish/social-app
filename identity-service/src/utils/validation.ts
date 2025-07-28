import Joi from 'joi';
import { LoginUserInput, RegisterUserInput } from '../types/identityControllerTypes';

const validateRegistration = (data:RegisterUserInput) => {
    const schema = Joi.object({
        userName : Joi.string().min(3).max(50).required(),
        email : Joi.string().email().required(),
        password : Joi.string().min(6).required(),
    })

    return schema.validate(data, {abortEarly : false});
}

const validateLogin = (data:LoginUserInput) => {
    const schema = Joi.object({
        email : Joi.string().email().required(),
        password : Joi.string().min(6).required(),
    })
    return schema.validate(data, {abortEarly : false});
}

export {
    validateRegistration,
    validateLogin
}