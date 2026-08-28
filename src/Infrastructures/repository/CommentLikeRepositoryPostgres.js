import CommentLikeRepository from '../../Domains/comment_likes/CommentLikeRepository.js';

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async addLike(userId, commentId) {
    await this._pool.query({
      text: 'INSERT INTO comment_likes(user_id, comment_id) VALUES($1, $2)',
      values: [userId, commentId],
    });
  }

  async deleteLike(userId, commentId) {
    await this._pool.query({
      text: 'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    });
  }

  async isCommentLiked(userId, commentId) {
    const result = await this._pool.query({
      text: 'SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    });

    return result.rowCount > 0;
  }

  async getLikeCountsByThreadId(threadId) {
    const result = await this._pool.query({
      text: `SELECT cl.comment_id, COUNT(*)::int AS like_count
             FROM comment_likes cl
             JOIN comments c ON c.id = cl.comment_id
             WHERE c.thread_id = $1
             GROUP BY cl.comment_id`,
      values: [threadId],
    });

    return result.rows;
  }
}

export default CommentLikeRepositoryPostgres;
