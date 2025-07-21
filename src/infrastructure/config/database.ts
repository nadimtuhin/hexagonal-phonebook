export type DatabaseAdapter = 'sqlite' | 'localstorage' | 'mysql';

export interface DatabaseConfig {
  adapter: DatabaseAdapter;
  sqlite?: {
    path: string;
  };
  mysql?: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const adapter = (process.env.DB_ADAPTER || 'sqlite') as DatabaseAdapter;

  return {
    adapter,
    sqlite: {
      path: process.env.SQLITE_PATH || './phonebook.db'
    },
    mysql: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'phonebook_user',
      password: process.env.MYSQL_PASSWORD || 'phonebook_pass',
      database: process.env.MYSQL_DATABASE || 'phonebook'
    }
  };
};