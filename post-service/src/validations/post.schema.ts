import Joi from 'joi';

const createPostSchema = Joi.object({
    content : Joi.string().min(4),
    mediaIds: Joi.array().items(Joi.string()).optional()    
})

export {
    createPostSchema
}