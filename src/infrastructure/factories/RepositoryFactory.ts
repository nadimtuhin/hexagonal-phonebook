import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { SqliteContactRepository } from '../adapters/sqlite/SqliteContactRepository';
import { LocalStorageContactRepository } from '../adapters/localstorage/LocalStorageContactRepository';
import { MysqlContactRepository } from '../adapters/mysql/MysqlContactRepository';
import { getDatabaseConfig } from '../config/database';

let repositoryInstance: ContactRepository | null = null;

export class RepositoryFactory {
  static async createContactRepository(): Promise<ContactRepository> {
    if (repositoryInstance) {
      return repositoryInstance;
    }

    const config = getDatabaseConfig();

    switch (config.adapter) {
      case 'sqlite':
        repositoryInstance = new SqliteContactRepository(config.sqlite?.path);
        break;
      
      case 'localstorage':
        repositoryInstance = new LocalStorageContactRepository();
        break;
      
      case 'mysql':
        if (!config.mysql) {
          throw new Error('MySQL configuration is missing');
        }
        repositoryInstance = new MysqlContactRepository({
          host: config.mysql.host,
          port: config.mysql.port,
          user: config.mysql.user,
          password: config.mysql.password,
          database: config.mysql.database
        });
        break;
      
      default:
        throw new Error(`Unsupported database adapter: ${config.adapter}`);
    }

    return repositoryInstance;
  }

  static resetInstance(): void {
    repositoryInstance = null;
  }
}