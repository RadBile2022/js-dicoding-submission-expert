import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import AddReplyUseCase from '../AddReplyUseCase.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate add reply correctly', async () => {
    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const replyRepository = new ReplyRepository();
    const expectedAddedReply = {
      id: 'reply-123',
      content: 'balasan',
      owner: 'user-123',
    };
    const mockAddedReply = {
      id: 'reply-123',
      content: 'balasan',
      owner: 'user-123',
    };

    threadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    commentRepository.verifyCommentAvailability = vi.fn().mockResolvedValue();
    replyRepository.addReply = vi.fn().mockResolvedValue(mockAddedReply);
    const useCase = new AddReplyUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
    });

    const result = await useCase.execute(
      'user-123',
      'thread-123',
      'comment-123',
      { content: 'balasan' },
    );

    expect(result).toStrictEqual(expectedAddedReply);
    expect(threadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-123');
    expect(commentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-123', 'thread-123');
    expect(replyRepository.addReply).toHaveBeenCalledWith(
      new NewReply({ content: 'balasan' }),
      'user-123',
      'comment-123',
    );
  });
});
