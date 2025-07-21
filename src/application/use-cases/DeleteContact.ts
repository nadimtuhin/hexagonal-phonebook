import { ContactRepository } from '@/domain/repositories/ContactRepository';

export class DeleteContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(id: string): Promise<void> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const deleted = await this.contactRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete contact');
    }
  }
}