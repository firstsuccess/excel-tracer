import {sqliteTable,integer,text} from 'drizzle-orm/sqlite-core';
export const accessTotal=sqliteTable('access_total',{id:integer('id').primaryKey(),total:integer('total').notNull().default(0)});
export const accessEvents=sqliteTable('access_events',{id:text('id').primaryKey(),createdAt:integer('created_at').notNull()});
