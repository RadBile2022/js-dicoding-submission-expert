import CommentLikeRepository from '../CommentLikeRepository.js';

describe('CommentLikeRepository interface', () => {
  it('should throw error when abstract methods are called', async () => {
    const repository = new CommentLikeRepository();

    await expect(repository.addLike('user-1', 'comment-1'))
      .rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.deleteLike('user-1', 'comment-1'))
      .rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.isCommentLiked('user-1', 'comment-1'))
      .rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.getLikeCountsByThreadId('thread-1'))
      .rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
