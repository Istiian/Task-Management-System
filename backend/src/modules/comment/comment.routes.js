import express from 'express';
import {
    createCommentController
} from './comment.controller.js';
import { commentSchema } from './comment.validatior.js';
import {validateForm} from '../../middleware/validateForm.js';
const router = express.Router();

router.post('/', createCommentController);


export default router;