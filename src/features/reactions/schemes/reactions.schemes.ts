import Joi, { ObjectSchema } from 'joi';

const addReactionSchema: ObjectSchema = Joi.object().keys({
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property'
  }),
  postReactions: Joi.object().optional().allow(null, ''),
  previousReaction: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  type: Joi.string().required().messages({
    'any.required': 'Reaction type is a required property'
  }),
  userTo: Joi.string().required().messages({
    'any.required': 'userTo is a required property'
  })
});

const removeReactionSchema: ObjectSchema = Joi.object().keys({
  postReactions: Joi.object().optional().allow(null, '')
});

export { addReactionSchema, removeReactionSchema };
