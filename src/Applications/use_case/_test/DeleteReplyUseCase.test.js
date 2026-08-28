import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate delete reply correctly', async () => {
    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const replyRepository = new ReplyRepository();
    threadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    commentRepository.verifyCommentAvailability = vi.fn().mockResolvedValue();
    replyRepository.verifyReplyAvailability = vi.fn().mockResolvedValue();
    replyRepository.verifyReplyOwner = vi.fn().mockResolvedValue();
    replyRepository.deleteReply = vi.fn().mockResolvedValue();
    const useCase = new DeleteReplyUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
    });

    await useCase.execute(
      'user-123',
      'thread-123',
      'comment-123',
      'reply-123',
    );

    expect(threadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-123');
    expect(commentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-123', 'thread-123');
    expect(replyRepository.verifyReplyAvailability)
      .toHaveBeenCalledWith('reply-123', 'comment-123');
    expect(replyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith('reply-123', 'user-123');
    expect(replyRepository.deleteReply).toHaveBeenCalledWith('reply-123');
  });
});
