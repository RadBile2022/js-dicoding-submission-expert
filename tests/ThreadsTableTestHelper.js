/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123',
    title = 'sebuah thread',
    body = 'sebuah body thread',
    owner = 'user-123',
    date = new Date('2026-01-01T00:00:00.000Z'),
  } = {}) {
    await pool.query({
      text: `INSERT INTO threads(id, title, body, owner, date)
             VALUES($1, $2, $3, $4, $5)`,
      values: [id, title, body, owner, date],
    });
  },
  async findThreadById(id) {
    const result = await pool.query({
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    });
    return result.rows;
  },
  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};
export default ThreadsTableTestHelper;
