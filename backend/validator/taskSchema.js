import joi from 'joi';

const taskSchema = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  status: joi.string().valid('pending', 'in progress', 'completed').required(),
  dueDate: joi.date().iso().required(),
});

export default taskSchema;



