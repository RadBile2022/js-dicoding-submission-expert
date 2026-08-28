/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'sebuah balasan',
    owner = 'user-123',
    commentId = 'comment-123',
    date = new Date('2026-01-01T00:02:00.000Z'),
    isDelete = false,
  } = {}) {
    await pool.query({
      text: `INSERT INTO replies(id, content, owner, comment_id, date, is_delete)
             VALUES($1, $2, $3, $4, $5, $6)`,
      values: [id, content, owner, commentId, date, isDelete],
    });
  },
  async findReplyById(id) {
    const result = await pool.query({
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    });
    return result.rows;
  },
  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};
export default RepliesTableTestHelper;
