export const up = (pgm) => {
  pgm.createTable('threads', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'TEXT', notNull: true },
    body: { type: 'TEXT', notNull: true },
    owner: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    date: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
};
export const down = (pgm) => pgm.dropTable('threads');
