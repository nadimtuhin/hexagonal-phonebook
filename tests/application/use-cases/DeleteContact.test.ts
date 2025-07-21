import { DeleteContactUseCase } from '@/application/use-cases/DeleteContact';
import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { ContactEntity } from '@/domain/entities/Contact';

describe('DeleteContactUseCase', () => {
  let mockRepository: jest.Mocked<ContactRepository>;
  let deleteContactUseCase: DeleteContactUseCase;

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
    deleteContactUseCase = new DeleteContactUseCase(mockRepository);
  });

  describe('execute', () => {
    const existingContact = new ContactEntity(
      'contact-id',
      'John',
      'Doe',
      '1234567890',
      'john@example.com'
    );

    it('should delete a contact successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.delete.mockResolvedValue(true);

      await expect(deleteContactUseCase.execute('contact-id')).resolves.not.toThrow();

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(mockRepository.delete).toHaveBeenCalledWith('contact-id');
    });

    it('should throw error when contact does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(deleteContactUseCase.execute('non-existent-id'))
        .rejects.toThrow('Contact not found');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when delete operation fails', async () => {
      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.delete.mockResolvedValue(false);

      await expect(deleteContactUseCase.execute('contact-id'))
        .rejects.toThrow('Failed to delete contact');

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(mockRepository.delete).toHaveBeenCalledWith('contact-id');
    });

    it('should handle repository findById errors', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(deleteContactUseCase.execute('contact-id'))
        .rejects.toThrow('Database error');

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository delete errors', async () => {
      mockRepository.findById.mockResolvedValue(existingContact);
      mockRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(deleteContactUseCase.execute('contact-id'))
        .rejects.toThrow('Database error');

      expect(mockRepository.findById).toHaveBeenCalledWith('contact-id');
      expect(mockRepository.delete).toHaveBeenCalledWith('contact-id');
    });

    it('should handle different contact IDs', async () => {
      const contactIds = ['id-1', 'id-2', 'different-uuid'];
      
      for (const id of contactIds) {
        const contact = new ContactEntity(id, 'Test', 'User', '1234567890');
        mockRepository.findById.mockResolvedValue(contact);
        mockRepository.delete.mockResolvedValue(true);

        await expect(deleteContactUseCase.execute(id)).resolves.not.toThrow();
        
        expect(mockRepository.findById).toHaveBeenCalledWith(id);
        expect(mockRepository.delete).toHaveBeenCalledWith(id);
      }
    });

    it('should not call delete when contact not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      try {
        await deleteContactUseCase.execute('non-existent-id');
      } catch (error) {
        // Expected to throw
      }

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});