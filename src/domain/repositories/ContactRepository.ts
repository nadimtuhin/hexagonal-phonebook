import { Contact } from '../entities/Contact';

export interface ContactRepository {
  findAll(): Promise<Contact[]>;
  findById(id: string): Promise<Contact | null>;
  findByPhoneNumber(phoneNumber: string): Promise<Contact | null>;
  search(query: string): Promise<Contact[]>;
  save(contact: Contact): Promise<Contact>;
  update(id: string, contact: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}