import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { Contact } from '@/domain/entities/Contact';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

export class UpdateContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email?: string;
      address?: string;
      notes?: string;
    }>
  ): Promise<Contact> {
    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      throw new Error('Contact not found');
    }

    const updateData = { ...data } as Record<string, unknown>;

    if (data.phoneNumber) {
      const phoneNumber = new PhoneNumber(data.phoneNumber);
      const contactWithPhone = await this.contactRepository.findByPhoneNumber(phoneNumber.toString());
      
      if (contactWithPhone && contactWithPhone.id !== id) {
        throw new Error('Another contact with this phone number already exists');
      }
      
      updateData.phoneNumber = phoneNumber.toString();
    }

    const updatedContact = await this.contactRepository.update(id, updateData);
    if (!updatedContact) {
      throw new Error('Failed to update contact');
    }

    return updatedContact;
  }
}