class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) { this._threadRepository = threadRepository; this._commentRepository = commentRepository; this._replyRepository = replyRepository; }
  async execute(owner, threadId, commentId, replyId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId, threadId);
    await this._replyRepository.verifyReplyAvailability(replyId, commentId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReply(replyId);
  }
}
export default DeleteReplyUseCase;
