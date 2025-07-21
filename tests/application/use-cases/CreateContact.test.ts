import { CreateContactUseCase } from '@/application/use-cases/CreateContact';
import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { Contact, ContactEntity } from '@/domain/entities/Contact';

describe('CreateContactUseCase', () => {
  let mockRepository: jest.Mocked<ContactRepository>;
  let createContactUseCase: CreateContactUseCase;

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
    createContactUseCase = new CreateContactUseCase(mockRepository);
  });

  describe('execute', () => {
    const validContactData = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      email: 'john@example.com',
      address: '123 Main St',
      notes: 'Test contact'
    };

    it('should create a contact successfully', async () => {
      const savedContact = new ContactEntity(
        'test-id',
        validContactData.firstName,
        validContactData.lastName,
        validContactData.phoneNumber,
        validContactData.email,
        validContactData.address,
        validContactData.notes
      );

      mockRepository.findByPhoneNumber.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(savedContact);

      const result = await createContactUseCase.execute(validContactData);

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
          email: 'john@example.com',
          address: '123 Main St',
          notes: 'Test contact'
        })
      );
      expect(result).toEqual(savedContact);
    });

    it('should create a contact with minimal required fields', async () => {
      const minimalContactData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890'
      };

      const savedContact = new ContactEntity(
        'test-id',
        minimalContactData.firstName,
        minimalContactData.lastName,
        minimalContactData.phoneNumber
      );

      mockRepository.findByPhoneNumber.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(savedContact);

      const result = await createContactUseCase.execute(minimalContactData);

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
          email: undefined,
          address: undefined,
          notes: undefined
        })
      );
      expect(result).toEqual(savedContact);
    });

    it('should throw error when firstName is empty', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        phoneNumber: '1234567890'
      };

      await expect(createContactUseCase.execute(invalidData))
        .rejects.toThrow('First name and last name are required');

      expect(mockRepository.findByPhoneNumber).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when lastName is empty', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: '',
        phoneNumber: '1234567890'
      };

      await expect(createContactUseCase.execute(invalidData))
        .rejects.toThrow('First name and last name are required');

      expect(mockRepository.findByPhoneNumber).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when firstName is missing', async () => {
      const invalidData = {
        firstName: undefined as any,
        lastName: 'Doe',
        phoneNumber: '1234567890'
      };

      await expect(createContactUseCase.execute(invalidData))
        .rejects.toThrow('First name and last name are required');

      expect(mockRepository.findByPhoneNumber).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when lastName is missing', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: undefined as any,
        phoneNumber: '1234567890'
      };

      await expect(createContactUseCase.execute(invalidData))
        .rejects.toThrow('First name and last name are required');

      expect(mockRepository.findByPhoneNumber).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid phone number format', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: 'invalid-phone'
      };

      await expect(createContactUseCase.execute(invalidData))
        .rejects.toThrow('Invalid phone number format');

      expect(mockRepository.findByPhoneNumber).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when phone number already exists', async () => {
      const existingContact = new ContactEntity(
        'existing-id',
        'Jane',
        'Smith',
        '1234567890'
      );

      mockRepository.findByPhoneNumber.mockResolvedValue(existingContact);

      await expect(createContactUseCase.execute(validContactData))
        .rejects.toThrow('A contact with this phone number already exists');

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should normalize phone number before checking duplicates', async () => {
      const dataWithFormattedPhone = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '(123) 456-7890'
      };

      const savedContact = new ContactEntity(
        'test-id',
        dataWithFormattedPhone.firstName,
        dataWithFormattedPhone.lastName,
        '1234567890'
      );

      mockRepository.findByPhoneNumber.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(savedContact);

      await createContactUseCase.execute(dataWithFormattedPhone);

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: '1234567890'
        })
      );
    });

    it('should handle repository save errors', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(null);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(createContactUseCase.execute(validContactData))
        .rejects.toThrow('Database error');

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle repository findByPhoneNumber errors', async () => {
      mockRepository.findByPhoneNumber.mockRejectedValue(new Error('Database error'));

      await expect(createContactUseCase.execute(validContactData))
        .rejects.toThrow('Database error');

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});