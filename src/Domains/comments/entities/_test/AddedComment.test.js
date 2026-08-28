import AddedComment from '../AddedComment.js';

describe('AddedComment entity', () => {
  it('should reject incomplete payload', () => {
    expect(() => new AddedComment({ id: 'comment-1', content: 'isi' }))
      .toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject invalid data type', () => {
    expect(() => new AddedComment({ id: 1, content: 'isi', owner: 'user-1' }))
      .toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entity correctly', () => {
    const payload = { id: 'comment-1', content: 'isi', owner: 'user-1' };
    const addedComment = new AddedComment(payload);

    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
