import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';

describe('CommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser();
    await ThreadsTableTestHelper.addThread();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should persist and return added comment', async () => {
    const repository = new CommentRepositoryPostgres(pool, () => '123');
    const result = await repository.addComment(
      new NewComment({ content: 'isi' }),
      'user-123',
      'thread-123',
    );
    expect(result).toStrictEqual(new AddedComment({
      id: 'comment-123', content: 'isi', owner: 'user-123',
    }));
    expect(await CommentsTableTestHelper.findCommentById('comment-123'))
      .toHaveLength(1);
  });

  it('should throw NotFoundError when comment is not available', async () => {
    const repository = new CommentRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyCommentAvailability('comment-x', 'thread-123'))
      .rejects.toThrowError(NotFoundError);
  });

  it('should not throw when comment is available', async () => {
    await CommentsTableTestHelper.addComment();
    const repository = new CommentRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyCommentAvailability('comment-123', 'thread-123'))
      .resolves.toBeUndefined();
  });

  it('should throw AuthorizationError when comment owner is different', async () => {
    await CommentsTableTestHelper.addComment();
    const repository = new CommentRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyCommentOwner('comment-123', 'user-x'))
      .rejects.toThrowError(AuthorizationError);
  });

  it('should not throw when comment owner is valid', async () => {
    await CommentsTableTestHelper.addComment();
    const repository = new CommentRepositoryPostgres(pool, () => '123');

    await expect(repository.verifyCommentOwner('comment-123', 'user-123'))
      .resolves.toBeUndefined();
  });

  it('should reject owner check when comment missing', async () => {
    const repository = new CommentRepositoryPostgres(pool, () => '123');
    await expect(repository.verifyCommentOwner('comment-x', 'user-123'))
      .rejects.toThrowError(NotFoundError);
  });

  it('should soft delete comment', async () => {
    await CommentsTableTestHelper.addComment();
    const repository = new CommentRepositoryPostgres(pool, () => '123');
    await repository.deleteComment('comment-123');
    const [comment] = await CommentsTableTestHelper.findCommentById('comment-123');
    expect(comment.is_delete).toEqual(true);
  });

  it('should return complete comments ordered ascending by date', async () => {
    const firstDate = new Date('2026-01-01T00:01:00.000Z');
    const secondDate = new Date('2026-01-01T00:02:00.000Z');
    await CommentsTableTestHelper.addComment({
      id: 'comment-2', content: 'komentar kedua', date: secondDate,
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-1', content: 'komentar pertama', date: firstDate,
    });
    const repository = new CommentRepositoryPostgres(pool, () => '123');

    const result = await repository.getCommentsByThreadId('thread-123');

    expect(result).toStrictEqual([
      {
        id: 'comment-1',
        username: 'dicoding',
        date: firstDate,
        content: 'komentar pertama',
        is_delete: false,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: secondDate,
        content: 'komentar kedua',
        is_delete: false,
      },
    ]);
  });
});
