const sanitizeHtml = require('sanitize-html');
const BaseJoi = require('joi');
const { number } = require('joi');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.espaceHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    alloweddTags: [],
                    allowedAttributes: {},

                });
                if (clean !== value) return helpers.error('string.espaceHTML', { value })
                return clean;
            }
        }
    }
});


const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
       title: Joi.string().required().escapeHTML(),
       // Numbers: Joi.number().required(),
        //price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        body:Joi.string().required().escapeHTML()
    }).required()
})