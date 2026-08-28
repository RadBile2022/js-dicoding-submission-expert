import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';

describe('ReplyRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser();
    await ThreadsTableTestHelper.addThread();
    await CommentsTableTestHelper.addComment();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should persist and return added reply', async () => {
    const repository = new ReplyRepositoryPostgres(pool, () => '123');
    const result = await repository.addReply(
      new NewReply({ content: 'balasan' }),
      'user-123',
      'comment-123',
    );
    expect(result).toStrictEqual(new AddedReply({
      id: 'reply-123', content: 'balasan', owner: 'user-123',
    }));
    expect(await RepliesTableTestHelper.findReplyById('reply-123'))
      .toHaveLength(1);
  });

  it('should throw NotFoundError when reply is not available', async () => {
    const repository = new ReplyRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyReplyAvailability('reply-x', 'comment-123'))
      .rejects.toThrowError(NotFoundError);
  });

  it('should not throw when reply is available', async () => {
    await RepliesTableTestHelper.addReply();
    const repository = new ReplyRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyReplyAvailability('reply-123', 'comment-123'))
      .resolves.toBeUndefined();
  });

  it('should throw AuthorizationError when reply owner is different', async () => {
    await RepliesTableTestHelper.addReply();
    const repository = new ReplyRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyReplyOwner('reply-123', 'user-x'))
      .rejects.toThrowError(AuthorizationError);
  });

  it('should not throw when reply owner is valid', async () => {
    await RepliesTableTestHelper.addReply();
    const repository = new ReplyRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyReplyOwner('reply-123', 'user-123'))
      .resolves.toBeUndefined();
  });

  it('should reject owner check when reply missing', async () => {
    const repository = new ReplyRepositoryPostgres(pool, () => '123');
    await expect(repository.verifyReplyOwner('reply-x', 'user-123'))
      .rejects.toThrowError(NotFoundError);
  });

  it('should soft delete reply', async () => {
    await RepliesTableTestHelper.addReply();
    const repository = new ReplyRepositoryPostgres(pool, () => '123');
    await repository.deleteReply('reply-123');
    const [reply] = await RepliesTableTestHelper.findReplyById('reply-123');
    expect(reply.is_delete).toEqual(true);
  });

  it('should return complete replies ordered ascending by date', async () => {
    const firstDate = new Date('2026-01-01T00:02:00.000Z');
    const secondDate = new Date('2026-01-01T00:03:00.000Z');
    await RepliesTableTestHelper.addReply({
      id: 'reply-2', content: 'balasan kedua', date: secondDate,
    });
    await RepliesTableTestHelper.addReply({
      id: 'reply-1', content: 'balasan pertama', date: firstDate,
    });
    const repository = new ReplyRepositoryPostgres(pool, () => '123');

    const result = await repository.getRepliesByThreadId('thread-123');

    expect(result).toStrictEqual([
      {
        id: 'reply-1',
        content: 'balasan pertama',
        date: firstDate,
        is_delete: false,
        comment_id: 'comment-123',
        username: 'dicoding',
      },
      {
        id: 'reply-2',
        content: 'balasan kedua',
        date: secondDate,
        is_delete: false,
        comment_id: 'comment-123',
        username: 'dicoding',
      },
    ]);
  });
});
