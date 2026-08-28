import NewThread from '../../Domains/threads/entities/NewThread.js';
class AddThreadUseCase {
  constructor({ threadRepository }) { this._threadRepository = threadRepository; }
  async execute(owner, payload) { return this._threadRepository.addThread(new NewThread(payload), owner); }
}
export default AddThreadUseCase;
