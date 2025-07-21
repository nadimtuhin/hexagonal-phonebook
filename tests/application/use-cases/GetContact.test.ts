import { GetContactUseCase } from '@/application/use-cases/GetContact';
import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { ContactEntity } from '@/domain/entities/Contact';

describe('GetContactUseCase', () => {
  let mockRepository: jest.Mocked<ContactRepository>;
  let getContactUseCase: GetContactUseCase;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPhoneNumber: jest.fn(),
      search: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    getContactUseCase = new GetContactUseCase(mockRepository);
  });

  describe('execute', () => {
    const existingContact = new ContactEntity(
      'contact-id',
      'John',
      'Doe',
      '1234567890',
      'john@example.com',
      '123 Main St',
      'Test notes'
    );

    it('should return a contact when it exists', async () => {
      mockRepository.findById.mockResolvedValue(existingContact);

      const result = await getContactUseCase.execute('contact-id');

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(result).toEqual(existingContact);
    });

    it('should throw error when contact does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(getContactUseCase.execute('non-existent-id'))
        .rejects.toThrow('Contact not found');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should handle repository errors', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(getContactUseCase.execute('contact-id'))
        .rejects.toThrow('Database error');

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
    });

    it('should handle different contact IDs', async () => {
      const contactIds = ['id-1', 'id-2', 'uuid-format', '12345'];
      
      for (const id of contactIds) {
        const contact = new ContactEntity(id, 'Test', 'User', '1234567890');
        mockRepository.findById.mockResolvedValue(contact);

        const result = await getContactUseCase.execute(id);
        
        expect(mockRepository.findById).toHaveBeenCalledWith(id);
        expect(result).toEqual(contact);
        expect(result.id).toBe(id);
      }
    });

    it('should return contact with all fields populated', async () => {
      const fullContact = new ContactEntity(
        'full-contact-id',
        'Jane',
        'Smith',
        '9876543210',
        'jane.smith@example.com',
        '456 Oak Avenue, Suite 789',
        'Important client - always available on weekends'
      );

      mockRepository.findById.mockResolvedValue(fullContact);

      const result = await getContactUseCase.execute('full-contact-id');

      expect(result.id).toBe('full-contact-id');
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.phoneNumber).toBe('9876543210');
      expect(result.email).toBe('jane.smith@example.com');
      expect(result.address).toBe('456 Oak Avenue, Suite 789');
      expect(result.notes).toBe('Important client - always available on weekends');
    });

    it('should return contact with minimal fields', async () => {
      const minimalContact = new ContactEntity(
        'minimal-contact-id',
        'Bob',
        'Johnson',
        '5555551234'
      );

      mockRepository.findById.mockResolvedValue(minimalContact);

      const result = await getContactUseCase.execute('minimal-contact-id');

      expect(result.id).toBe('minimal-contact-id');
      expect(result.firstName).toBe('Bob');
      expect(result.lastName).toBe('Johnson');
      expect(result.phoneNumber).toBe('5555551234');
      expect(result.email).toBeUndefined();
      expect(result.address).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });

    it('should preserve contact dates', async () => {
      const createdAt = new Date('2023-01-01T10:00:00Z');
      const updatedAt = new Date('2023-06-01T15:30:00Z');
      
      const contactWithDates = new ContactEntity(
        'date-contact-id',
        'Alice',
        'Brown',
        '1112223333',
        'alice@example.com',
        undefined,
        undefined,
        createdAt,
        updatedAt
      );

      mockRepository.findById.mockResolvedValue(contactWithDates);

      const result = await getContactUseCase.execute('date-contact-id');

      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
    });
  });
});