import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { Contact } from '@/domain/entities/Contact';

export class ListContactsUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(searchQuery?: string): Promise<{
    contacts: Contact[];
    total: number;
  }> {
    const contacts = searchQuery
      ? await this.contactRepository.search(searchQuery)
      : await this.contactRepository.findAll();
    
    const total = await this.contactRepository.count();
    
    return {
      contacts,
      total
    };
  }
}