import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddCommentUseCase from '../AddCommentUseCase.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate add comment correctly', async () => {
    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const expectedAddedComment = {
      id: 'comment-123',
      content: 'isi',
      owner: 'user-123',
    };
    const mockAddedComment = {
      id: 'comment-123',
      content: 'isi',
      owner: 'user-123',
    };

    threadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    commentRepository.addComment = vi.fn().mockResolvedValue(mockAddedComment);
    const useCase = new AddCommentUseCase({
      threadRepository,
      commentRepository,
    });

    const result = await useCase.execute(
      'user-123',
      'thread-123',
      { content: 'isi' },
    );

    expect(result).toStrictEqual(expectedAddedComment);
    expect(threadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-123');
    expect(commentRepository.addComment).toHaveBeenCalledWith(
      new NewComment({ content: 'isi' }),
      'user-123',
      'thread-123',
    );
  });
});
