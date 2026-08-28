import NewReply from '../NewReply.js';

describe('NewReply entity', () => {
  it('should reject incomplete payload', () => {
    expect(() => new NewReply({}))
      .toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject invalid data type', () => {
    expect(() => new NewReply({ content: 123 }))
      .toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entity correctly', () => {
    const payload = { content: 'balasan' };
    const newReply = new NewReply(payload);

    expect(newReply.content).toEqual(payload.content);
  });
});
