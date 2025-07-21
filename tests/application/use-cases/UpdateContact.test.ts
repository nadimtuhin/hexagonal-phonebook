import { UpdateContactUseCase } from '@/application/use-cases/UpdateContact';
import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { ContactEntity } from '@/domain/entities/Contact';

describe('UpdateContactUseCase', () => {
  let mockRepository: jest.Mocked<ContactRepository>;
  let updateContactUseCase: UpdateContactUseCase;

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
    updateContactUseCase = new UpdateContactUseCase(mockRepository);
  });

  const existingContact = new ContactEntity(
    'contact-id',
    'John',
    'Doe',
    '1234567890',
    'john@example.com',
    '123 Main St',
    'Original notes'
  );

  describe('execute', () => {
    it('should update a contact successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      };

      const updatedContact = new ContactEntity(
        'contact-id',
        'Jane',
        'Smith',
        '1234567890',
        'jane@example.com',
        '123 Main St',
        'Original notes'
      );

      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.update.mockResolvedValue(updatedContact);

      const result = await updateContactUseCase.execute('contact-id', updateData);

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(mockRepository.update).toHaveBeenCalledWith('contact-id', updateData);
      expect(result).toEqual(updatedContact);
    });

    it('should throw error when contact does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(updateContactUseCase.execute('non-existent-id', { firstName: 'Jane' }))
        .rejects.toThrow('Contact not found');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update phone number when valid', async () => {
      const updateData = {
        phoneNumber: '9876543210'
      };

      const updatedContact = new ContactEntity(
        'contact-id',
        'John',
        'Doe',
        '9876543210',
        'john@example.com',
        '123 Main St',
        'Original notes'
      );

      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.findByPhoneNumber.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updatedContact);

      const result = await updateContactUseCase.execute('contact-id', updateData);

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('9876543210');
      expect(mockRepository.update).toHaveBeenCalledWith('contact-id', { phoneNumber: '9876543210' });
      expect(result).toEqual(updatedContact);
    });

    it('should normalize phone number before updating', async () => {
      const updateData = {
        phoneNumber: '(987) 654-3210'
      };

      const updatedContact = new ContactEntity(
        'contact-id',
        'John',
        'Doe',
        '9876543210',
        'john@example.com',
        '123 Main St',
        'Original notes'
      );

      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.findByPhoneNumber.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updatedContact);

      await updateContactUseCase.execute('contact-id', updateData);

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('9876543210');
      expect(mockRepository.update).toHaveBeenCalledWith('contact-id', { phoneNumber: '9876543210' });
    });

    it('should throw error when phone number already exists for another contact', async () => {
      const anotherContact = new ContactEntity(
        'another-id',
        'Jane',
        'Smith',
        '9876543210'
      );

      const updateData = {
        phoneNumber: '9876543210'
      };

      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.findByPhoneNumber.mockResolvedValue(anotherContact);

      await expect(updateContactUseCase.execute('contact-id', updateData))
        .rejects.toThrow('Another contact with this phone number already exists');

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('9876543210');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same phone number (same contact)', async () => {
      const updateData = {
        phoneNumber: '1234567890',
        firstName: 'Jane'
      };

      const updatedContact = new ContactEntity(
        'contact-id',
        'Jane',
        'Doe',
        '1234567890',
        'john@example.com',
        '123 Main St',
        'Original notes'
      );

      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.findByPhoneNumber.mockResolvedValue(existingContact);
      mockRepository.update.mockResolvedValue(updatedContact);

      const result = await updateContactUseCase.execute('contact-id', updateData);

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(mockRepository.update).toHaveBeenCalledWith('contact-id', {
        phoneNumber: '1234567890',
        firstName: 'Jane'
      });
      expect(result).toEqual(updatedContact);
    });

    it('should throw error for invalid phone number format', async () => {
      const updateData = {
        phoneNumber: 'invalid-phone'
      };

      mockRepository.findById.mockResolvedValue(existingContact);

      await expect(updateContactUseCase.execute('contact-id', updateData))
        .rejects.toThrow('Invalid phone number format');

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(mockRepository.findByPhoneNumber).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when repository update returns null', async () => {
      const updateData = {
        firstName: 'Jane'
      };

      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.update.mockResolvedValue(null);

      await expect(updateContactUseCase.execute('contact-id', updateData))
        .rejects.toThrow('Failed to update contact');

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(mockRepository.update).toHaveBeenCalledWith('contact-id', updateData);
    });

    it('should handle partial updates', async () => {
      const updateData = {
        email: 'newemail@example.com'
      };

      const updatedContact = new ContactEntity(
        'contact-id',
        'John',
        'Doe',
        '1234567890',
        'newemail@example.com',
        '123 Main St',
        'Original notes'
      );

      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.update.mockResolvedValue(updatedContact);

      const result = await updateContactUseCase.execute('contact-id', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith('contact-id', updateData);
      expect(result).toEqual(updatedContact);
    });

    it('should handle empty update data', async () => {
      const updateData = {};

      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.update.mockResolvedValue(existingContact);

      const result = await updateContactUseCase.execute('contact-id', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith('contact-id', updateData);
      expect(result).toEqual(existingContact);
    });

    it('should handle repository errors', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(updateContactUseCase.execute('contact-id', { firstName: 'Jane' }))
        .rejects.toThrow('Database error');
    });
  });
});