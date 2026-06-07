import Comment from '../../models/comment.js';

export const createComment = async (content, authorId, taskId) => {
    try {
        const comment = await Comment.create({ content, authorId, taskId });
        return comment;
    } catch (error) {
        throw new Error('Error creating comment: ' + error.message);
    }
};