import pool from '../../database/postgres/pool.js';
import CommentLikeRepositoryPostgres from '../CommentLikeRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';

describe('CommentLikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser();
    await ThreadsTableTestHelper.addThread();
    await CommentsTableTestHelper.addComment();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should persist like', async () => {
    const repository = new CommentLikeRepositoryPostgres(pool);

    await repository.addLike('user-123', 'comment-123');

    const likes = await CommentLikesTableTestHelper.findLike('user-123', 'comment-123');
    expect(likes).toHaveLength(1);
  });

  it('should report whether comment is liked by user', async () => {
    const repository = new CommentLikeRepositoryPostgres(pool);

    expect(await repository.isCommentLiked('user-123', 'comment-123')).toBe(false);

    await CommentLikesTableTestHelper.addLike();

    expect(await repository.isCommentLiked('user-123', 'comment-123')).toBe(true);
  });

  it('should delete like', async () => {
    await CommentLikesTableTestHelper.addLike();
    const repository = new CommentLikeRepositoryPostgres(pool);

    await repository.deleteLike('user-123', 'comment-123');

    const likes = await CommentLikesTableTestHelper.findLike('user-123', 'comment-123');
    expect(likes).toHaveLength(0);
  });

  it('should return like count for comments in a thread', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-124', username: 'johndoe' });
    await CommentLikesTableTestHelper.addLike();
    await CommentLikesTableTestHelper.addLike({ userId: 'user-124' });
    const repository = new CommentLikeRepositoryPostgres(pool);

    const counts = await repository.getLikeCountsByThreadId('thread-123');

    expect(counts).toStrictEqual([
      { comment_id: 'comment-123', like_count: 2 },
    ]);
  });
});
