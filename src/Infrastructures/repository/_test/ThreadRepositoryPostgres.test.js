import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';

describe('ThreadRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should persist and return added thread', async () => {
    const repository = new ThreadRepositoryPostgres(pool, () => '123');
    const result = await repository.addThread(
      new NewThread({ title: 'judul', body: 'isi' }),
      'user-123',
    );

    expect(result).toStrictEqual(new AddedThread({
      id: 'thread-123', title: 'judul', owner: 'user-123',
    }));
    expect(await ThreadsTableTestHelper.findThreadById('thread-123'))
      .toHaveLength(1);
  });

  it('should throw NotFoundError when thread is not available', async () => {
    const repository = new ThreadRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyThreadAvailability('thread-x'))
      .rejects.toThrowError(NotFoundError);
  });

  it('should not throw when thread is available', async () => {
    await ThreadsTableTestHelper.addThread();
    const repository = new ThreadRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyThreadAvailability('thread-123'))
      .resolves.toBeUndefined();
  });

  it('should get complete thread detail with username', async () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-123',
      date,
    });
    const repository = new ThreadRepositoryPostgres(pool, () => '123');

    const result = await repository.getThreadById('thread-123');

    expect(result).toStrictEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date,
      username: 'dicoding',
    });
  });

  it('should reject missing thread detail', async () => {
    const repository = new ThreadRepositoryPostgres(pool, () => '123');
    await expect(repository.getThreadById('thread-x'))
      .rejects.toThrowError(NotFoundError);
  });
});
