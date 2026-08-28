import AddedThread from '../AddedThread.js';

describe('AddedThread entity', () => {
  it('should reject incomplete payload', () => {
    expect(() => new AddedThread({ id: 'thread-1', title: 'judul' }))
      .toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject invalid data type', () => {
    expect(() => new AddedThread({ id: 1, title: 'judul', owner: 'user-1' }))
      .toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entity correctly', () => {
    const payload = { id: 'thread-1', title: 'judul', owner: 'user-1' };
    const addedThread = new AddedThread(payload);

    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
