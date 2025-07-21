import { ListContactsUseCase } from '@/application/use-cases/ListContacts';
import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { ContactEntity } from '@/domain/entities/Contact';

describe('ListContactsUseCase', () => {
  let mockRepository: jest.Mocked<ContactRepository>;
  let listContactsUseCase: ListContactsUseCase;

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
    listContactsUseCase = new ListContactsUseCase(mockRepository);
  });

  const sampleContacts = [
    new ContactEntity('1', 'John', 'Doe', '1234567890', 'john@example.com'),
    new ContactEntity('2', 'Jane', 'Smith', '9876543210', 'jane@example.com'),
    new ContactEntity('3', 'Bob', 'Johnson', '5555551234', 'bob@example.com')
  ];

  describe('execute', () => {
    it('should return all contacts when no search query provided', async () => {
      mockRepository.findAll.mockResolvedValue(sampleContacts);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.search).not.toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
      expect(result.contacts).toEqual(sampleContacts);
      expect(result.total).toBe(3);
    });

    it('should return all contacts when search query is empty string', async () => {
      mockRepository.findAll.mockResolvedValue(sampleContacts);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute('');

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.search).not.toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
      expect(result.contacts).toEqual(sampleContacts);
      expect(result.total).toBe(3);
    });

    it('should return all contacts when search query is undefined', async () => {
      mockRepository.findAll.mockResolvedValue(sampleContacts);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute(undefined);

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.search).not.toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
      expect(result.contacts).toEqual(sampleContacts);
      expect(result.total).toBe(3);
    });

    it('should search contacts when search query is provided', async () => {
      const searchResults = [sampleContacts[0]]; // Only John matches
      mockRepository.search.mockResolvedValue(searchResults);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute('John');

      expect(mockRepository.search).toHaveBeenCalledWith('John');
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
      expect(result.contacts).toEqual(searchResults);
      expect(result.total).toBe(3);
    });

    it('should handle search with phone number query', async () => {
      const searchResults = [sampleContacts[1]]; // Jane's phone
      mockRepository.search.mockResolvedValue(searchResults);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute('987');

      expect(mockRepository.search).toHaveBeenCalledWith('987');
      expect(result.contacts).toEqual(searchResults);
      expect(result.total).toBe(3);
    });

    it('should handle search with email query', async () => {
      const searchResults = [sampleContacts[2]]; // Bob's email
      mockRepository.search.mockResolvedValue(searchResults);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute('bob@example.com');

      expect(mockRepository.search).toHaveBeenCalledWith('bob@example.com');
      expect(result.contacts).toEqual(searchResults);
      expect(result.total).toBe(3);
    });

    it('should return empty array when no contacts found', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const result = await listContactsUseCase.execute();

      expect(result.contacts).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return empty array when search yields no results', async () => {
      mockRepository.search.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute('nonexistent');

      expect(mockRepository.search).toHaveBeenCalledWith('nonexistent');
      expect(result.contacts).toEqual([]);
      expect(result.total).toBe(3);
    });

    it('should handle case-sensitive search queries', async () => {
      const searchResults = [sampleContacts[0]];
      mockRepository.search.mockResolvedValue(searchResults);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute('JOHN');

      expect(mockRepository.search).toHaveBeenCalledWith('JOHN');
      expect(result.contacts).toEqual(searchResults);
    });

    it('should handle special characters in search', async () => {
      const searchResults = [];
      mockRepository.search.mockResolvedValue(searchResults);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute('@#$%');

      expect(mockRepository.search).toHaveBeenCalledWith('@#$%');
      expect(result.contacts).toEqual(searchResults);
    });

    it('should handle whitespace in search query', async () => {
      const searchResults = [sampleContacts[0]];
      mockRepository.search.mockResolvedValue(searchResults);
      mockRepository.count.mockResolvedValue(3);

      const result = await listContactsUseCase.execute('  John  ');

      expect(mockRepository.search).toHaveBeenCalledWith('  John  ');
      expect(result.contacts).toEqual(searchResults);
    });

    it('should handle repository findAll errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(listContactsUseCase.execute())
        .rejects.toThrow('Database error');

      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should handle repository search errors', async () => {
      mockRepository.search.mockRejectedValue(new Error('Search error'));

      await expect(listContactsUseCase.execute('John'))
        .rejects.toThrow('Search error');

      expect(mockRepository.search).toHaveBeenCalledWith('John');
    });

    it('should handle repository count errors', async () => {
      mockRepository.findAll.mockResolvedValue(sampleContacts);
      mockRepository.count.mockRejectedValue(new Error('Count error'));

      await expect(listContactsUseCase.execute())
        .rejects.toThrow('Count error');

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.count).toHaveBeenCalled();
    });

    it('should return correct structure with contacts and total', async () => {
      mockRepository.findAll.mockResolvedValue(sampleContacts);
      mockRepository.count.mockResolvedValue(100);

      const result = await listContactsUseCase.execute();

      expect(result).toHaveProperty('contacts');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.contacts)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(result.contacts.length).toBe(3);
      expect(result.total).toBe(100);
    });
  });
});