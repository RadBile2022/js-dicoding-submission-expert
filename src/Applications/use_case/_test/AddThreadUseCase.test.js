import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread correctly', async () => {
    const threadRepository = new ThreadRepository();
    const expectedAddedThread = {
      id: 'thread-123',
      title: 'judul',
      owner: 'user-123',
    };
    const mockAddedThread = {
      id: 'thread-123',
      title: 'judul',
      owner: 'user-123',
    };

    threadRepository.addThread = vi.fn().mockResolvedValue(mockAddedThread);
    const useCase = new AddThreadUseCase({ threadRepository });

    const result = await useCase.execute('user-123', {
      title: 'judul',
      body: 'isi',
    });

    expect(result).toStrictEqual(expectedAddedThread);
    expect(threadRepository.addThread).toHaveBeenCalledWith(
      new NewThread({ title: 'judul', body: 'isi' }),
      'user-123',
    );
  });
});
