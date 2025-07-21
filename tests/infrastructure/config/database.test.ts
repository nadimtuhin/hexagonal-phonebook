import { getDatabaseConfig } from '@/infrastructure/config/database';

describe('Database Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getDatabaseConfig', () => {
    it('should return default configuration', () => {
      const config = getDatabaseConfig();

      expect(config.adapter).toBe('sqlite');
      expect(config.sqlite?.path).toBe('./phonebook.db');
      expect(config.mysql?.host).toBe('localhost');
      expect(config.mysql?.port).toBe(3306);
      expect(config.mysql?.user).toBe('phonebook_user');
      expect(config.mysql?.password).toBe('phonebook_pass');
      expect(config.mysql?.database).toBe('phonebook');
    });

    it('should use environment variables when provided', () => {
      process.env.DB_ADAPTER = 'mysql';
      process.env.SQLITE_PATH = './custom.db';
      process.env.MYSQL_HOST = 'custom-host';
      process.env.MYSQL_PORT = '5432';
      process.env.MYSQL_USER = 'custom_user';
      process.env.MYSQL_PASSWORD = 'custom_pass';
      process.env.MYSQL_DATABASE = 'custom_db';

      const config = getDatabaseConfig();

      expect(config.adapter).toBe('mysql');
      expect(config.sqlite?.path).toBe('./custom.db');
      expect(config.mysql?.host).toBe('custom-host');
      expect(config.mysql?.port).toBe(5432);
      expect(config.mysql?.user).toBe('custom_user');
      expect(config.mysql?.password).toBe('custom_pass');
      expect(config.mysql?.database).toBe('custom_db');
    });

    it('should handle different adapter types', () => {
      process.env.DB_ADAPTER = 'localstorage';
      
      const config = getDatabaseConfig();
      
      expect(config.adapter).toBe('localstorage');
    });

    it('should handle invalid port numbers', () => {
      process.env.MYSQL_PORT = 'invalid';
      
      const config = getDatabaseConfig();
      
      expect(config.mysql?.port).toBeNaN();
    });

    it('should handle missing environment variables gracefully', () => {
      delete process.env.DB_ADAPTER;
      delete process.env.MYSQL_HOST;
      
      const config = getDatabaseConfig();
      
      expect(config.adapter).toBe('sqlite');
      expect(config.mysql?.host).toBe('localhost');
    });
  });
});