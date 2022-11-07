import Joi, { ObjectSchema } from 'joi';

const addCommentSchema: ObjectSchema = Joi.object().keys({
  comment: Joi.string().required().messages({
    'any.required': 'comment is a required property'
  }),
  commentsCount: Joi.number().optional().allow(null, ''),
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property'
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
  userTo: Joi.string().required().messages({
    'any.required': 'userTo is a required property'
  })
});

export { addCommentSchema };
