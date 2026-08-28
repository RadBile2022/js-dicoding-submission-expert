import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentLikeRepository from '../../../Domains/comment_likes/CommentLikeRepository.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should compose detail, mask deleted contents, and include likeCount', async () => {
    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const replyRepository = new ReplyRepository();
    const commentLikeRepository = new CommentLikeRepository();
    const date = new Date('2026-01-01T00:00:00.000Z');

    const mockThread = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date,
      username: 'dicoding',
    };
    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date,
        content: 'isi komentar',
        is_delete: true,
      },
    ];
    const mockReplies = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        username: 'dicoding',
        date,
        content: 'isi reply',
        is_delete: true,
      },
    ];
    const mockLikeCounts = [
      { comment_id: 'comment-123', like_count: 2 },
    ];
    const expectedResult = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date,
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date,
          replies: [
            {
              id: 'reply-123',
              content: '**balasan telah dihapus**',
              date,
              username: 'dicoding',
            },
          ],
          content: '**komentar telah dihapus**',
          likeCount: 2,
        },
      ],
    };

    threadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    threadRepository.getThreadById = vi.fn().mockResolvedValue(mockThread);
    commentRepository.getCommentsByThreadId = vi.fn().mockResolvedValue(mockComments);
    replyRepository.getRepliesByThreadId = vi.fn().mockResolvedValue(mockReplies);
    commentLikeRepository.getLikeCountsByThreadId = vi.fn().mockResolvedValue(mockLikeCounts);

    const useCase = new GetThreadDetailUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
      commentLikeRepository,
    });

    const result = await useCase.execute('thread-123');

    expect(result).toStrictEqual(expectedResult);
    expect(threadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-123');
    expect(threadRepository.getThreadById)
      .toHaveBeenCalledWith('thread-123');
    expect(commentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith('thread-123');
    expect(replyRepository.getRepliesByThreadId)
      .toHaveBeenCalledWith('thread-123');
    expect(commentLikeRepository.getLikeCountsByThreadId)
      .toHaveBeenCalledWith('thread-123');
  });

  it('should keep active content and use zero likeCount when comment has no likes', async () => {
    const threadRepository = new ThreadRepository();
    const commentRepository = new CommentRepository();
    const replyRepository = new ReplyRepository();
    const commentLikeRepository = new CommentLikeRepository();
    const threadDate = new Date('2026-01-01T00:00:00.000Z');
    const commentDate = new Date('2026-01-01T00:01:00.000Z');
    const replyDate = new Date('2026-01-01T00:02:00.000Z');

    const mockThread = {
      id: 'thread-1',
      title: 'judul aktif',
      body: 'isi thread aktif',
      date: threadDate,
      username: 'dicoding',
    };
    const mockComments = [
      {
        id: 'comment-1',
        username: 'a',
        date: commentDate,
        content: 'aktif',
        is_delete: false,
      },
    ];
    const mockReplies = [
      {
        id: 'reply-1',
        comment_id: 'comment-1',
        username: 'b',
        date: replyDate,
        content: 'reply aktif',
        is_delete: false,
      },
    ];
    const mockLikeCounts = [];
    const expectedResult = {
      id: 'thread-1',
      title: 'judul aktif',
      body: 'isi thread aktif',
      date: threadDate,
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'a',
          date: commentDate,
          replies: [
            {
              id: 'reply-1',
              content: 'reply aktif',
              date: replyDate,
              username: 'b',
            },
          ],
          content: 'aktif',
          likeCount: 0,
        },
      ],
    };

    threadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    threadRepository.getThreadById = vi.fn().mockResolvedValue(mockThread);
    commentRepository.getCommentsByThreadId = vi.fn().mockResolvedValue(mockComments);
    replyRepository.getRepliesByThreadId = vi.fn().mockResolvedValue(mockReplies);
    commentLikeRepository.getLikeCountsByThreadId = vi.fn().mockResolvedValue(mockLikeCounts);

    const useCase = new GetThreadDetailUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
      commentLikeRepository,
    });

    const result = await useCase.execute('thread-1');

    expect(result).toStrictEqual(expectedResult);
    expect(threadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-1');
    expect(threadRepository.getThreadById)
      .toHaveBeenCalledWith('thread-1');
    expect(commentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith('thread-1');
    expect(replyRepository.getRepliesByThreadId)
      .toHaveBeenCalledWith('thread-1');
    expect(commentLikeRepository.getLikeCountsByThreadId)
      .toHaveBeenCalledWith('thread-1');
  });
});
