import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import CommentLikeRepository from '../../../Domains/comment_likes/CommentLikeRepository.js';
import ToggleCommentLikeUseCase from '../ToggleCommentLikeUseCase.js';

describe('ToggleCommentLikeUseCase', () => {
  it('should add like when comment has not been liked by user', async () => {
    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const commentLikeRepository = new CommentLikeRepository();

    threadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    commentRepository.verifyCommentAvailability = vi.fn().mockResolvedValue();
    commentLikeRepository.isCommentLiked = vi.fn().mockResolvedValue(false);
    commentLikeRepository.addLike = vi.fn().mockResolvedValue();
    commentLikeRepository.deleteLike = vi.fn().mockResolvedValue();

    const useCase = new ToggleCommentLikeUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository,
    });

    await useCase.execute('user-123', 'thread-123', 'comment-123');

    expect(threadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-123');
    expect(commentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-123', 'thread-123');
    expect(commentLikeRepository.isCommentLiked)
      .toHaveBeenCalledWith('user-123', 'comment-123');
    expect(commentLikeRepository.addLike)
      .toHaveBeenCalledWith('user-123', 'comment-123');
    expect(commentLikeRepository.deleteLike).not.toHaveBeenCalled();
  });

  it('should delete like when comment has already been liked by user', async () => {
    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const commentLikeRepository = new CommentLikeRepository();

    threadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    commentRepository.verifyCommentAvailability = vi.fn().mockResolvedValue();
    commentLikeRepository.isCommentLiked = vi.fn().mockResolvedValue(true);
    commentLikeRepository.addLike = vi.fn().mockResolvedValue();
    commentLikeRepository.deleteLike = vi.fn().mockResolvedValue();

    const useCase = new ToggleCommentLikeUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository,
    });

    await useCase.execute('user-123', 'thread-123', 'comment-123');

    expect(threadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-123');
    expect(commentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-123', 'thread-123');
    expect(commentLikeRepository.isCommentLiked)
      .toHaveBeenCalledWith('user-123', 'comment-123');
    expect(commentLikeRepository.deleteLike)
      .toHaveBeenCalledWith('user-123', 'comment-123');
    expect(commentLikeRepository.addLike).not.toHaveBeenCalled();
  });
});
