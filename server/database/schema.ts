import { sql } from 'drizzle-orm';
import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';

export const generations = table('generations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  audioId: text('audio_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
