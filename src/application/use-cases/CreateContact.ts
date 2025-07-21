import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { Contact, ContactEntity } from '@/domain/entities/Contact';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

export class CreateContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    address?: string;
    notes?: string;
  }): Promise<Contact> {
    if (!data.firstName || !data.lastName) {
      throw new Error('First name and last name are required');
    }

    const phoneNumber = new PhoneNumber(data.phoneNumber);

    const existingContact = await this.contactRepository.findByPhoneNumber(phoneNumber.toString());
    if (existingContact) {
      throw new Error('A contact with this phone number already exists');
    }

    const contact = new ContactEntity(
      '',
      data.firstName,
      data.lastName,
      phoneNumber.toString(),
      data.email,
      data.address,
      data.notes
    );

    return await this.contactRepository.save(contact);
  }
}