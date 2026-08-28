class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) { this._threadRepository = threadRepository; this._commentRepository = commentRepository; }
  async execute(owner, threadId, commentId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }
}
export default DeleteCommentUseCase;
