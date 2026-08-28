class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);
    const likeCounts = await this._commentLikeRepository.getLikeCountsByThreadId(threadId);

    return {
      ...thread,
      comments: comments.map((comment) => {
        const like = likeCounts.find((item) => item.comment_id === comment.id);

        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          replies: replies
            .filter((reply) => reply.comment_id === comment.id)
            .map((reply) => ({
              id: reply.id,
              content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
              date: reply.date,
              username: reply.username,
            })),
          content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
          likeCount: like ? like.like_count : 0,
        };
      }),
    };
  }
}

export default GetThreadDetailUseCase;
