import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import GetThreadDetailUseCase from '../../../../Applications/use_case/GetThreadDetailUseCase.js';
import AddReplyUseCase from '../../../../Applications/use_case/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/DeleteReplyUseCase.js';
import ToggleCommentLikeUseCase from '../../../../Applications/use_case/ToggleCommentLikeUseCase.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const addedThread = await this._container
        .getInstance(AddThreadUseCase.name)
        .execute(req.auth.credentials.id, req.body);
      res.status(201).json({ status: 'success', data: { addedThread } });
    } catch (error) {
      next(error);
    }
  }

  async getThreadByIdHandler(req, res, next) {
    try {
      const thread = await this._container
        .getInstance(GetThreadDetailUseCase.name)
        .execute(req.params.threadId);
      res.json({ status: 'success', data: { thread } });
    } catch (error) {
      next(error);
    }
  }

  async postCommentHandler(req, res, next) {
    try {
      const addedComment = await this._container
        .getInstance(AddCommentUseCase.name)
        .execute(req.auth.credentials.id, req.params.threadId, req.body);
      res.status(201).json({ status: 'success', data: { addedComment } });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      await this._container
        .getInstance(DeleteCommentUseCase.name)
        .execute(req.auth.credentials.id, req.params.threadId, req.params.commentId);
      res.json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }

  async postReplyHandler(req, res, next) {
    try {
      const addedReply = await this._container
        .getInstance(AddReplyUseCase.name)
        .execute(
          req.auth.credentials.id,
          req.params.threadId,
          req.params.commentId,
          req.body,
        );
      res.status(201).json({ status: 'success', data: { addedReply } });
    } catch (error) {
      next(error);
    }
  }

  async deleteReplyHandler(req, res, next) {
    try {
      await this._container
        .getInstance(DeleteReplyUseCase.name)
        .execute(
          req.auth.credentials.id,
          req.params.threadId,
          req.params.commentId,
          req.params.replyId,
        );
      res.json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }

  async putCommentLikeHandler(req, res, next) {
    try {
      await this._container
        .getInstance(ToggleCommentLikeUseCase.name)
        .execute(req.auth.credentials.id, req.params.threadId, req.params.commentId);
      res.json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadsHandler;
