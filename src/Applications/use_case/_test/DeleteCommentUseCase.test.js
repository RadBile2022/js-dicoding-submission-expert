import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate delete comment correctly', async () => {
    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    threadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    commentRepository.verifyCommentAvailability = vi.fn().mockResolvedValue();
    commentRepository.verifyCommentOwner = vi.fn().mockResolvedValue();
    commentRepository.deleteComment = vi.fn().mockResolvedValue();
    const useCase = new DeleteCommentUseCase({
      threadRepository,
      commentRepository,
    });

    await useCase.execute('user-123', 'thread-123', 'comment-123');

    expect(threadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-123');
    expect(commentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-123', 'thread-123');
    expect(commentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith('comment-123', 'user-123');
    expect(commentRepository.deleteComment)
      .toHaveBeenCalledWith('comment-123');
  });
});
