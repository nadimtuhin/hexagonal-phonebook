import Database from 'better-sqlite3';
import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { Contact, ContactEntity } from '@/domain/entities/Contact';
import { randomUUID } from 'crypto';

export class SqliteContactRepository implements ContactRepository {
  private db: Database.Database;

  constructor(databasePath: string = './phonebook.db') {
    this.db = new Database(databasePath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        email TEXT,
        address TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_phone ON contacts(phoneNumber);
      CREATE INDEX IF NOT EXISTS idx_name ON contacts(firstName, lastName);
    `;
    this.db.exec(createTableQuery);
  }

  async findAll(): Promise<Contact[]> {
    const stmt = this.db.prepare('SELECT * FROM contacts ORDER BY firstName, lastName');
    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(row => this.mapRowToContact(row));
  }

  async findById(id: string): Promise<Contact | null> {
    const stmt = this.db.prepare('SELECT * FROM contacts WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? this.mapRowToContact(row) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Contact | null> {
    const stmt = this.db.prepare('SELECT * FROM contacts WHERE phoneNumber = ?');
    const row = stmt.get(phoneNumber) as Record<string, unknown> | undefined;
    return row ? this.mapRowToContact(row) : null;
  }

  async search(query: string): Promise<Contact[]> {
    const searchPattern = `%${query}%`;
    const stmt = this.db.prepare(`
      SELECT * FROM contacts 
      WHERE firstName LIKE ? OR lastName LIKE ? OR phoneNumber LIKE ? OR email LIKE ?
      ORDER BY firstName, lastName
    `);
    const rows = stmt.all(searchPattern, searchPattern, searchPattern, searchPattern) as Record<string, unknown>[];
    return rows.map(row => this.mapRowToContact(row));
  }

  async save(contact: Contact): Promise<Contact> {
    const id = contact.id || randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO contacts (id, firstName, lastName, phoneNumber, email, address, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      contact.firstName,
      contact.lastName,
      contact.phoneNumber,
      contact.email || null,
      contact.address || null,
      contact.notes || null,
      contact.createdAt?.toISOString() || now,
      contact.updatedAt?.toISOString() || now
    );
    
    return this.findById(id) as Promise<Contact>;
  }

  async update(id: string, data: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...data, updatedAt: new Date() };
    
    const stmt = this.db.prepare(`
      UPDATE contacts 
      SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, address = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updated.firstName,
      updated.lastName,
      updated.phoneNumber,
      updated.email || null,
      updated.address || null,
      updated.notes || null,
      updated.updatedAt.toISOString(),
      id
    );
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM contacts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async count(): Promise<number> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM contacts');
    const result = stmt.get() as { count: number };
    return result.count;
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

  close(): void {
    this.db.close();
  }
}