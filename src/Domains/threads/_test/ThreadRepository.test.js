import ThreadRepository from '../ThreadRepository.js';

describe('ThreadRepository interface', () => {
  it('should throw error when abstract methods called', async () => {
    const repository = new ThreadRepository();
    await expect(repository.addThread()).rejects
      .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.verifyThreadAvailability()).rejects
      .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.getThreadById()).rejects
      .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
