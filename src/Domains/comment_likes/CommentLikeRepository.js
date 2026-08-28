class CommentLikeRepository {
  async addLike(userId, commentId) {
    throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteLike(userId, commentId) {
    throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async isCommentLiked(userId, commentId) {
    throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getLikeCountsByThreadId(threadId) {
    throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

export default CommentLikeRepository;
