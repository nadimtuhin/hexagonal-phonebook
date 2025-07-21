import { ContactService } from '@/application/services/ContactService';
import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { ContactEntity } from '@/domain/entities/Contact';

describe('ContactService', () => {
  let mockRepository: jest.Mocked<ContactRepository>;
  let contactService: ContactService;

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
    contactService = new ContactService(mockRepository);
  });

  const sampleContact = new ContactEntity(
    'test-id',
    'John',
    'Doe',
    '1234567890',
    'john@example.com'
  );

  describe('createContact', () => {
    it('should delegate to CreateContactUseCase', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        email: 'john@example.com'
      };

      mockRepository.findByPhoneNumber.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(sampleContact);

      const result = await contactService.createContact(contactData);

      expect(result).toEqual(sampleContact);
      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateContact', () => {
    it('should delegate to UpdateContactUseCase', async () => {
      const updateData = { firstName: 'Jane' };
      const updatedContact = { ...sampleContact, firstName: 'Jane' };

      mockRepository.findById.mockResolvedValue(sampleContact);
      mockRepository.update.mockResolvedValue(updatedContact);

      const result = await contactService.updateContact('test-id', updateData);

      expect(result).toEqual(updatedContact);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', updateData);
    });
  });

  describe('deleteContact', () => {
    it('should delegate to DeleteContactUseCase', async () => {
      mockRepository.findById.mockResolvedValue(sampleContact);
      mockRepository.delete.mockResolvedValue(true);

      await contactService.deleteContact('test-id');

      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockRepository.delete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('getContact', () => {
    it('should delegate to GetContactUseCase', async () => {
      mockRepository.findById.mockResolvedValue(sampleContact);

      const result = await contactService.getContact('test-id');

      expect(result).toEqual(sampleContact);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
    });
  });

  describe('listContacts', () => {
    it('should delegate to ListContactsUseCase', async () => {
      const contacts = [sampleContact];
      mockRepository.findAll.mockResolvedValue(contacts);
      mockRepository.count.mockResolvedValue(1);

      const result = await contactService.listContacts();

      expect(result.contacts).toEqual(contacts);
      expect(result.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
    });

    it('should handle search queries', async () => {
      const contacts = [sampleContact];
      mockRepository.search.mockResolvedValue(contacts);
      mockRepository.count.mockResolvedValue(1);

      const result = await contactService.listContacts('John');

      expect(result.contacts).toEqual(contacts);
      expect(mockRepository.search).toHaveBeenCalledWith('John');
    });
  });
});