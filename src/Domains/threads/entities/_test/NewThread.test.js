import NewThread from '../NewThread.js';

describe('NewThread entity', () => {
  it('should reject incomplete payload', () => {
    expect(() => new NewThread({ title: 'judul' }))
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject invalid data type', () => {
    expect(() => new NewThread({ title: 123, body: 'isi' }))
      .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entity correctly', () => {
    const payload = { title: 'judul', body: 'isi' };
    const newThread = new NewThread(payload);

    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
