import mysql from 'mysql2/promise';
import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { Contact, ContactEntity } from '@/domain/entities/Contact';
import { randomUUID } from 'crypto';

export class MysqlContactRepository implements ContactRepository {
  private pool: mysql.Pool;

  constructor(config: mysql.PoolOptions) {
    this.pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS contacts (
          id VARCHAR(36) PRIMARY KEY,
          firstName VARCHAR(100) NOT NULL,
          lastName VARCHAR(100) NOT NULL,
          phoneNumber VARCHAR(20) NOT NULL,
          email VARCHAR(100),
          address TEXT,
          notes TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          INDEX idx_phone (phoneNumber),
          INDEX idx_name (firstName, lastName)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } finally {
      connection.release();
    }
  }

  async findAll(): Promise<Contact[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM contacts ORDER BY firstName, lastName'
    );
    return (rows as Record<string, unknown>[]).map(this.mapRowToContact);
  }

  async findById(id: string): Promise<Contact | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM contacts WHERE id = ?',
      [id]
    );
    const result = rows as Record<string, unknown>[];
    return result.length > 0 ? this.mapRowToContact(result[0]) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Contact | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM contacts WHERE phoneNumber = ?',
      [phoneNumber]
    );
    const result = rows as Record<string, unknown>[];
    return result.length > 0 ? this.mapRowToContact(result[0]) : null;
  }

  async search(query: string): Promise<Contact[]> {
    const searchPattern = `%${query}%`;
    const [rows] = await this.pool.execute(
      `SELECT * FROM contacts 
       WHERE firstName LIKE ? OR lastName LIKE ? OR phoneNumber LIKE ? OR email LIKE ?
       ORDER BY firstName, lastName`,
      [searchPattern, searchPattern, searchPattern, searchPattern]
    );
    return (rows as Record<string, unknown>[]).map(this.mapRowToContact);
  }

  async save(contact: Contact): Promise<Contact> {
    const id = contact.id || randomUUID();
    const now = new Date();
    
    await this.pool.execute(
      `INSERT INTO contacts (id, firstName, lastName, phoneNumber, email, address, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        contact.firstName,
        contact.lastName,
        contact.phoneNumber,
        contact.email || null,
        contact.address || null,
        contact.notes || null,
        contact.createdAt || now,
        contact.updatedAt || now
      ]
    );
    
    return this.findById(id) as Promise<Contact>;
  }

  async update(id: string, data: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...data, updatedAt: new Date() };
    
    await this.pool.execute(
      `UPDATE contacts 
       SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, address = ?, notes = ?, updatedAt = ?
       WHERE id = ?`,
      [
        updated.firstName,
        updated.lastName,
        updated.phoneNumber,
        updated.email || null,
        updated.address || null,
        updated.notes || null,
        updated.updatedAt,
        id
      ]
    );
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.pool.execute(
      'DELETE FROM contacts WHERE id = ?',
      [id]
    );
    return (result as { affectedRows: number }).affectedRows > 0;
  }

  async count(): Promise<number> {
    const [rows] = await this.pool.execute(
      'SELECT COUNT(*) as count FROM contacts'
    );
    return (rows as { count: number }[])[0].count;
  }

  private mapRowToContact(row: Record<string, unknown>): Contact {
    return new ContactEntity(
      row.id as string,
      row.firstName as string,
      row.lastName as string,
      row.phoneNumber as string,
      row.email as string | undefined,
      row.address as string | undefined,
      row.notes as string | undefined,
      new Date(row.createdAt as string),
      new Date(row.updatedAt as string)
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}