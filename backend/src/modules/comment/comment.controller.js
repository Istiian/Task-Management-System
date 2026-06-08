import {createComment} from './comment.service.js';

export const createCommentController = async (req, res, next) => {
    const { content, taskId } = req.body;
    const authorId = req.user.id;
    try {
        const comment = await createComment(content, authorId, taskId);
        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
}