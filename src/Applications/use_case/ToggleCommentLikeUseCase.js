class ToggleCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(userId, threadId, commentId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId, threadId);

    const isLiked = await this._commentLikeRepository.isCommentLiked(userId, commentId);

    if (isLiked) {
      await this._commentLikeRepository.deleteLike(userId, commentId);
      return;
    }

    await this._commentLikeRepository.addLike(userId, commentId);
  }
}

export default ToggleCommentLikeUseCase;
