describe('config', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    vi.resetModules();
  });

  it('should load development configuration', async () => {
    process.env.NODE_ENV = 'development';
    vi.resetModules();

    const { default: config } = await import('../config.js');

    expect(config.app.host).toEqual('localhost');
    expect(config.app.debug).toEqual({ request: ['error'] });
  });

  it('should load production configuration', async () => {
    process.env.NODE_ENV = 'production';
    vi.resetModules();

    const { default: config } = await import('../config.js');

    expect(config.app.host).toEqual('0.0.0.0');
    expect(config.app.debug).toEqual({});
  });
});
