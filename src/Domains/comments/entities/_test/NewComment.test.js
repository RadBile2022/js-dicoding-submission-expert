import NewComment from '../NewComment.js';

describe('NewComment entity', () => {
  it('should reject incomplete payload', () => {
    expect(() => new NewComment({}))
      .toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject invalid data type', () => {
    expect(() => new NewComment({ content: 123 }))
      .toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entity correctly', () => {
    const payload = { content: 'isi' };
    const newComment = new NewComment(payload);

    expect(newComment.content).toEqual(payload.content);
  });
});
