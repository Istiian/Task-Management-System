import Comment from '../../models/comment.js';
import { ApiError } from '../../util/apiError.js';

export const createComment = async (content, authorId, taskId) => {
    console.log('Creating comment with data:', { content, authorId, taskId });
    const comment = await Comment.create({ content, authorId, taskId });
    return comment;
};