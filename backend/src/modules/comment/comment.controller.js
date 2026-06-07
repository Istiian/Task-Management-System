import {createComment} from './comment.service.js';

export const createCommentController = async (req, res) => {
    const { content, authorId, taskId } = req.body;
    try {
        const comment = await createComment(content, authorId, taskId);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}