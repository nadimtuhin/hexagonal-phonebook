import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { Contact, ContactEntity } from '@/domain/entities/Contact';

export class LocalStorageContactRepository implements ContactRepository {
  private readonly storageKey = 'phonebook_contacts';

  private getContacts(): Contact[] {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    
    try {
      const contacts = JSON.parse(data);
      return contacts.map((c: Record<string, unknown>) => new ContactEntity(
        c.id as string,
        c.firstName as string,
        c.lastName as string,
        c.phoneNumber as string,
        c.email as string | undefined,
        c.address as string | undefined,
        c.notes as string | undefined,
        new Date(c.createdAt as string),
        new Date(c.updatedAt as string)
      ));
    } catch {
      return [];
    }
  }

  private saveContacts(contacts: Contact[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(contacts));
  }

  async findAll(): Promise<Contact[]> {
    const contacts = this.getContacts();
    return contacts.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  async findById(id: string): Promise<Contact | null> {
    const contacts = this.getContacts();
    return contacts.find(c => c.id === id) || null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Contact | null> {
    const contacts = this.getContacts();
    return contacts.find(c => c.phoneNumber === phoneNumber) || null;
  }

  async search(query: string): Promise<Contact[]> {
    const contacts = this.getContacts();
    const lowerQuery = query.toLowerCase();
    
    return contacts.filter(contact => 
      contact.firstName.toLowerCase().includes(lowerQuery) ||
      contact.lastName.toLowerCase().includes(lowerQuery) ||
      contact.phoneNumber.includes(query) ||
      (contact.email && contact.email.toLowerCase().includes(lowerQuery))
    ).sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  async save(contact: Contact): Promise<Contact> {
    const contacts = this.getContacts();
    const id = contact.id || crypto.randomUUID();
    
    const newContact = new ContactEntity(
      id,
      contact.firstName,
      contact.lastName,
      contact.phoneNumber,
      contact.email,
      contact.address,
      contact.notes,
      contact.createdAt || new Date(),
      contact.updatedAt || new Date()
    );
    
    contacts.push(newContact);
    this.saveContacts(contacts);
    
    return newContact;
  }

  async update(id: string, data: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact | null> {
    const contacts = this.getContacts();
    const index = contacts.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const existing = contacts[index];
    const updated = new ContactEntity(
      existing.id,
      data.firstName ?? existing.firstName,
      data.lastName ?? existing.lastName,
      data.phoneNumber ?? existing.phoneNumber,
      data.email ?? existing.email,
      data.address ?? existing.address,
      data.notes ?? existing.notes,
      existing.createdAt,
      new Date()
    );
    
    contacts[index] = updated;
    this.saveContacts(contacts);
    
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const contacts = this.getContacts();
    const initialLength = contacts.length;
    const filtered = contacts.filter(c => c.id !== id);
    
    if (filtered.length < initialLength) {
      this.saveContacts(filtered);
      return true;
    }
    
    return false;
  }

  async count(): Promise<number> {
    return this.getContacts().length;
  }
}