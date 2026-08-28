import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

const registerAndLogin = async (app, username = 'dicoding') => {
  await request(app).post('/users').send({
    username,
    password: 'secret',
    fullname: 'Dicoding Indonesia',
  });
  const login = await request(app).post('/authentications').send({
    username,
    password: 'secret',
  });
  return login.body.data.accessToken;
};

describe('Forum API resources', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should add thread, comment, reply, and return detail', async () => {
    const app = await createServer(container);
    const accessToken = await registerAndLogin(app);

    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'sebuah thread', body: 'sebuah body thread' });

    expect(threadResponse.status).toEqual(201);
    expect(threadResponse.body.status).toEqual('success');
    const { id: threadId } = threadResponse.body.data.addedThread;

    const commentResponse = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'sebuah comment' });

    expect(commentResponse.status).toEqual(201);
    const { id: commentId } = commentResponse.body.data.addedComment;

    const replyResponse = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'sebuah balasan' });

    expect(replyResponse.status).toEqual(201);

    const detailResponse = await request(app).get(`/threads/${threadId}`);

    expect(detailResponse.status).toEqual(200);
    expect(detailResponse.body.data.thread.title).toEqual('sebuah thread');
    expect(detailResponse.body.data.thread.comments).toHaveLength(1);
    expect(detailResponse.body.data.thread.comments[0].content)
      .toEqual('sebuah comment');
    expect(detailResponse.body.data.thread.comments[0].replies).toHaveLength(1);
  });

  it('should soft delete comment and reply in detail response', async () => {
    const app = await createServer(container);
    const accessToken = await registerAndLogin(app);

    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'judul', body: 'isi' });
    const threadId = threadResponse.body.data.addedThread.id;

    const commentResponse = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'komentar' });
    const commentId = commentResponse.body.data.addedComment.id;

    const replyResponse = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'balasan' });
    const replyId = replyResponse.body.data.addedReply.id;

    expect((await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      .set('Authorization', `Bearer ${accessToken}`)).status).toEqual(200);

    expect((await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)).status).toEqual(200);

    const detail = await request(app).get(`/threads/${threadId}`);
    expect(detail.body.data.thread.comments[0].content)
      .toEqual('**komentar telah dihapus**');
    expect(detail.body.data.thread.comments[0].replies[0].content)
      .toEqual('**balasan telah dihapus**');
  });

  it('should protect restricted resources', async () => {
    const app = await createServer(container);
    const response = await request(app)
      .post('/threads')
      .send({ title: 'judul', body: 'isi' });
    expect(response.status).toEqual(401);
    expect(response.body.status).toEqual('fail');
  });

  it('should reject invalid thread payload', async () => {
    const app = await createServer(container);
    const accessToken = await registerAndLogin(app);
    const response = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'judul' });
    expect(response.status).toEqual(400);
    expect(response.body.status).toEqual('fail');
  });

  it('should reject adding comment to missing thread', async () => {
    const app = await createServer(container);
    const accessToken = await registerAndLogin(app);
    const response = await request(app)
      .post('/threads/thread-x/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'komentar' });
    expect(response.status).toEqual(404);
    expect(response.body.status).toEqual('fail');
  });

  it('should reject deleting another user comment', async () => {
    const app = await createServer(container);
    const ownerToken = await registerAndLogin(app, 'owner');
    const otherToken = await registerAndLogin(app, 'other');

    const thread = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'judul', body: 'isi' });
    const threadId = thread.body.data.addedThread.id;

    const comment = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'komentar' });
    const commentId = comment.body.data.addedComment.id;

    const response = await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toEqual(403);
    expect(response.body.status).toEqual('fail');
  });

  it('should return 404 for missing thread detail', async () => {
    const app = await createServer(container);
    const response = await request(app).get('/threads/thread-x');
    expect(response.status).toEqual(404);
    expect(response.body.status).toEqual('fail');
  });

  it('should reject invalid authentication scheme', async () => {
    const app = await createServer(container);
    const response = await request(app)
      .post('/threads')
      .set('Authorization', 'Basic invalid-token')
      .send({ title: 'judul', body: 'isi' });

    expect(response.status).toEqual(401);
    expect(response.body.status).toEqual('fail');
  });

  it('should reject invalid access token', async () => {
    const app = await createServer(container);
    const response = await request(app)
      .post('/threads')
      .set('Authorization', 'Bearer invalid-token')
      .send({ title: 'judul', body: 'isi' });

    expect(response.status).toEqual(401);
    expect(response.body.status).toEqual('fail');
  });

  it('should reject invalid reply payload', async () => {
    const app = await createServer(container);
    const accessToken = await registerAndLogin(app);

    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'judul', body: 'isi' });
    const threadId = threadResponse.body.data.addedThread.id;

    const commentResponse = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'komentar' });
    const commentId = commentResponse.body.data.addedComment.id;

    const response = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toEqual(400);
    expect(response.body.status).toEqual('fail');
  });

  it('should reject deleting another user reply', async () => {
    const app = await createServer(container);
    const ownerToken = await registerAndLogin(app, 'replyowner');
    const otherToken = await registerAndLogin(app, 'replyother');

    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'judul', body: 'isi' });
    const threadId = threadResponse.body.data.addedThread.id;

    const commentResponse = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'komentar' });
    const commentId = commentResponse.body.data.addedComment.id;

    const replyResponse = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'balasan' });
    const replyId = replyResponse.body.data.addedReply.id;

    const response = await request(app)
      .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toEqual(403);
    expect(response.body.status).toEqual('fail');
  });


  it('should like and unlike comment and expose likeCount in thread detail', async () => {
    const app = await createServer(container);
    const ownerToken = await registerAndLogin(app, 'likeowner');
    const likerToken = await registerAndLogin(app, 'liker');

    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'judul like', body: 'isi' });
    const threadId = threadResponse.body.data.addedThread.id;

    const commentResponse = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'komentar untuk like' });
    const commentId = commentResponse.body.data.addedComment.id;

    const likeResponse = await request(app)
      .put(`/threads/${threadId}/comments/${commentId}/likes`)
      .set('Authorization', `Bearer ${likerToken}`);

    expect(likeResponse.status).toEqual(200);
    expect(likeResponse.body).toStrictEqual({ status: 'success' });

    const likedDetail = await request(app).get(`/threads/${threadId}`);
    expect(likedDetail.status).toEqual(200);
    expect(likedDetail.body.data.thread.comments[0].likeCount).toEqual(1);

    const unlikeResponse = await request(app)
      .put(`/threads/${threadId}/comments/${commentId}/likes`)
      .set('Authorization', `Bearer ${likerToken}`);

    expect(unlikeResponse.status).toEqual(200);
    expect(unlikeResponse.body).toStrictEqual({ status: 'success' });

    const unlikedDetail = await request(app).get(`/threads/${threadId}`);
    expect(unlikedDetail.body.data.thread.comments[0].likeCount).toEqual(0);
  });

  it('should protect comment like resource', async () => {
    const app = await createServer(container);
    const response = await request(app)
      .put('/threads/thread-123/comments/comment-123/likes');

    expect(response.status).toEqual(401);
    expect(response.body.status).toEqual('fail');
  });

  it('should reject like for missing comment', async () => {
    const app = await createServer(container);
    const accessToken = await registerAndLogin(app, 'likemissing');

    const threadResponse = await request(app)
      .post('/threads')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'judul', body: 'isi' });
    const threadId = threadResponse.body.data.addedThread.id;

    const response = await request(app)
      .put(`/threads/${threadId}/comments/comment-x/likes`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toEqual(404);
    expect(response.body.status).toEqual('fail');
  });

});
