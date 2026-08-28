import ReplyRepository from '../ReplyRepository.js';

describe('ReplyRepository interface', () => {
  it('should throw error when abstract methods called', async () => {
    const repository = new ReplyRepository();
    await expect(repository.addReply()).rejects
      .toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.verifyReplyAvailability()).rejects
      .toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.verifyReplyOwner()).rejects
      .toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.deleteReply()).rejects
      .toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.getRepliesByThreadId()).rejects
      .toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
