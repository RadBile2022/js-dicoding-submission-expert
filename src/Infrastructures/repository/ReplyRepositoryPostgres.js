import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) { super(); this._pool = pool; this._idGenerator = idGenerator; }
  async addReply(newReply, owner, commentId) {
    const id = `reply-${this._idGenerator()}`;
    const result = await this._pool.query({ text: 'INSERT INTO replies(id, content, owner, comment_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner', values: [id, newReply.content, owner, commentId] });
    return new AddedReply(result.rows[0]);
  }
  async verifyReplyAvailability(replyId, commentId) {
    const result = await this._pool.query({ text: 'SELECT id FROM replies WHERE id = $1 AND comment_id = $2', values: [replyId, commentId] });
    if (!result.rowCount) throw new NotFoundError('balasan tidak ditemukan');
  }
  async verifyReplyOwner(replyId, owner) {
    const result = await this._pool.query({ text: 'SELECT owner FROM replies WHERE id = $1', values: [replyId] });
    if (!result.rowCount) throw new NotFoundError('balasan tidak ditemukan');
    if (result.rows[0].owner !== owner) throw new AuthorizationError('anda tidak berhak menghapus balasan ini');
  }
  async deleteReply(replyId) { await this._pool.query({ text: 'UPDATE replies SET is_delete = true WHERE id = $1', values: [replyId] }); }
  async getRepliesByThreadId(threadId) {
    const result = await this._pool.query({ text: 'SELECT r.id, r.content, r.date, r.is_delete, r.comment_id, u.username FROM replies r JOIN comments c ON c.id = r.comment_id JOIN users u ON u.id = r.owner WHERE c.thread_id = $1 ORDER BY r.date ASC', values: [threadId] });
    return result.rows;
  }
}
export default ReplyRepositoryPostgres;
