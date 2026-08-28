/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'sebuah komentar',
    owner = 'user-123',
    threadId = 'thread-123',
    date = new Date('2026-01-01T00:01:00.000Z'),
    isDelete = false,
  } = {}) {
    await pool.query({
      text: `INSERT INTO comments(id, content, owner, thread_id, date, is_delete)
             VALUES($1, $2, $3, $4, $5, $6)`,
      values: [id, content, owner, threadId, date, isDelete],
    });
  },
  async findCommentById(id) {
    const result = await pool.query({
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    });
    return result.rows;
  },
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};
export default CommentsTableTestHelper;
