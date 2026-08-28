import AddedComment from '../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) { super(); this._pool = pool; this._idGenerator = idGenerator; }
  async addComment(newComment, owner, threadId) {
    const id = `comment-${this._idGenerator()}`;
    const result = await this._pool.query({ text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner', values: [id, newComment.content, owner, threadId] });
    return new AddedComment(result.rows[0]);
  }
  async verifyCommentAvailability(commentId, threadId) {
    const result = await this._pool.query({ text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2', values: [commentId, threadId] });
    if (!result.rowCount) throw new NotFoundError('komentar tidak ditemukan');
  }
  async verifyCommentOwner(commentId, owner) {
    const result = await this._pool.query({ text: 'SELECT owner FROM comments WHERE id = $1', values: [commentId] });
    if (!result.rowCount) throw new NotFoundError('komentar tidak ditemukan');
    if (result.rows[0].owner !== owner) throw new AuthorizationError('anda tidak berhak menghapus komentar ini');
  }
  async deleteComment(commentId) { await this._pool.query({ text: 'UPDATE comments SET is_delete = true WHERE id = $1', values: [commentId] }); }
  async getCommentsByThreadId(threadId) {
    const result = await this._pool.query({ text: 'SELECT c.id, u.username, c.date, c.content, c.is_delete FROM comments c JOIN users u ON u.id = c.owner WHERE c.thread_id = $1 ORDER BY c.date ASC', values: [threadId] });
    return result.rows;
  }
}
export default CommentRepositoryPostgres;
