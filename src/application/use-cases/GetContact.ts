import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { Contact } from '@/domain/entities/Contact';

export class GetContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return contact;
  }
}