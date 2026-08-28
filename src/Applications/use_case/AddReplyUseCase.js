import NewReply from '../../Domains/replies/entities/NewReply.js';
class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) { this._threadRepository = threadRepository; this._commentRepository = commentRepository; this._replyRepository = replyRepository; }
  async execute(owner, threadId, commentId, payload) {
    const newReply = new NewReply(payload);
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId, threadId);
    return this._replyRepository.addReply(newReply, owner, commentId);
  }
}
export default AddReplyUseCase;
