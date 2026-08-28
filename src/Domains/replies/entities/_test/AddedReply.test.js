import AddedReply from '../AddedReply.js';

describe('AddedReply entity', () => {
  it('should reject incomplete payload', () => {
    expect(() => new AddedReply({ id: 'reply-1', content: 'isi' }))
      .toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject invalid data type', () => {
    expect(() => new AddedReply({ id: 1, content: 'isi', owner: 'user-1' }))
      .toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entity correctly', () => {
    const payload = { id: 'reply-1', content: 'isi', owner: 'user-1' };
    const addedReply = new AddedReply(payload);

    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
