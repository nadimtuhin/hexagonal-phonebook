import { LocalStorageContactRepository } from '@/infrastructure/adapters/localstorage/LocalStorageContactRepository';
import { ContactEntity } from '@/domain/entities/Contact';

describe('LocalStorageContactRepository', () => {
  let repository: LocalStorageContactRepository;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockLocalStorage = {};
    
    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    repository = new LocalStorageContactRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const sampleContact = new ContactEntity(
    'test-id',
    'John',
    'Doe',
    '1234567890',
    'john@example.com',
    '123 Main St',
    'Test contact'
  );

  describe('findAll', () => {
    it('should return empty array when no contacts exist', async () => {
      const contacts = await repository.findAll();
      expect(contacts).toEqual([]);
    });

    it('should return all contacts sorted by name', async () => {
      const contacts = [
        new ContactEntity('1', 'John', 'Doe', '1111111111'),
        new ContactEntity('2', 'Alice', 'Smith', '2222222222'),
        new ContactEntity('3', 'Bob', 'Johnson', '3333333333')
      ];
      
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);

      const result = await repository.findAll();
      
      expect(result).toHaveLength(3);
      expect(result[0].firstName).toBe('Alice');
      expect(result[1].firstName).toBe('Bob');
      expect(result[2].firstName).toBe('John');
    });

    it('should handle corrupted localStorage data', async () => {
      mockLocalStorage['phonebook_contacts'] = 'invalid json';

      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return empty array when window is undefined (SSR)', async () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const result = await repository.findAll();
      expect(result).toEqual([]);

      global.window = originalWindow;
    });
  });

  describe('findById', () => {
    it('should return contact when found', async () => {
      const contacts = [sampleContact];
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);

      const result = await repository.findById('test-id');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-id');
      expect(result?.firstName).toBe('John');
    });

    it('should return null when contact not found', async () => {
      const contacts = [sampleContact];
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);

      const result = await repository.findById('non-existent');
      expect(result).toBeNull();
    });

    it('should return null when no contacts exist', async () => {
      const result = await repository.findById('test-id');
      expect(result).toBeNull();
    });
  });

  describe('findByPhoneNumber', () => {
    it('should return contact when phone number matches', async () => {
      const contacts = [sampleContact];
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);

      const result = await repository.findByPhoneNumber('1234567890');
      
      expect(result).toBeDefined();
      expect(result?.phoneNumber).toBe('1234567890');
    });

    it('should return null when phone number not found', async () => {
      const contacts = [sampleContact];
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);

      const result = await repository.findByPhoneNumber('9999999999');
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      const contacts = [
        new ContactEntity('1', 'John', 'Doe', '1234567890', 'john@example.com'),
        new ContactEntity('2', 'Jane', 'Smith', '9876543210', 'jane@example.com'),
        new ContactEntity('3', 'Bob', 'Johnson', '5555551234', 'bob@work.com')
      ];
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);
    });

    it('should search by first name', async () => {
      const result = await repository.search('john');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(c => c.firstName === 'John')).toBe(true);
    });

    it('should search by last name', async () => {
      const result = await repository.search('smith');
      
      expect(result).toHaveLength(1);
      expect(result[0].lastName).toBe('Smith');
    });

    it('should search by phone number', async () => {
      const result = await repository.search('987');
      
      expect(result).toHaveLength(1);
      expect(result[0].phoneNumber).toBe('9876543210');
    });

    it('should search by email', async () => {
      const result = await repository.search('work');
      
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('bob@work.com');
    });

    it('should be case insensitive', async () => {
      const result = await repository.search('JOHN');
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(contact => contact.firstName === 'John')).toBe(true);
    });

    it('should return empty array when no matches', async () => {
      const result = await repository.search('nonexistent');
      expect(result).toEqual([]);
    });

    it('should return multiple matches sorted by name', async () => {
      const result = await repository.search('example.com');
      
      expect(result).toHaveLength(2);
      expect(result[0].firstName).toBe('Jane');
      expect(result[1].firstName).toBe('John');
    });
  });

  describe('save', () => {
    it('should save a new contact', async () => {
      const newContact = new ContactEntity(
        '',
        'Alice',
        'Brown',
        '1111111111',
        'alice@example.com'
      );

      const result = await repository.save(newContact);
      
      expect(result.id).toBeTruthy();
      expect(result.firstName).toBe('Alice');
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should save contact with existing ID', async () => {
      const existingContact = new ContactEntity(
        'existing-id',
        'Test',
        'User',
        '2222222222'
      );

      const result = await repository.save(existingContact);
      
      expect(result.id).toBe('existing-id');
      expect(result.firstName).toBe('Test');
    });

    it('should generate new ID when contact ID is empty', async () => {
      const newContact = new ContactEntity(
        '',
        'New',
        'Contact',
        '3333333333'
      );

      const result = await repository.save(newContact);
      
      expect(result.id).toBeTruthy();
      expect(result.id).not.toBe('');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      const contacts = [sampleContact];
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);
    });

    it('should update existing contact', async () => {
      const updateData = {
        firstName: 'Jane',
        email: 'jane@example.com'
      };

      const result = await repository.update('test-id', updateData);
      
      expect(result).toBeDefined();
      expect(result?.firstName).toBe('Jane');
      expect(result?.lastName).toBe('Doe'); // unchanged
      expect(result?.email).toBe('jane@example.com');
    });

    it('should return null when contact not found', async () => {
      const result = await repository.update('non-existent', { firstName: 'Test' });
      expect(result).toBeNull();
    });

    it('should update updatedAt timestamp', async () => {
      const originalDate = sampleContact.updatedAt;
      
      jest.useFakeTimers();
      const newDate = new Date('2024-01-01');
      jest.setSystemTime(newDate);

      const result = await repository.update('test-id', { firstName: 'Updated' });
      
      expect(result?.updatedAt).toEqual(newDate);
      expect(result?.updatedAt).not.toEqual(originalDate);
      
      jest.useRealTimers();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      const contacts = [
        sampleContact,
        new ContactEntity('other-id', 'Other', 'Contact', '9999999999')
      ];
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);
    });

    it('should delete existing contact', async () => {
      const result = await repository.delete('test-id');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should return false when contact not found', async () => {
      const result = await repository.delete('non-existent');
      expect(result).toBe(false);
    });

    it('should remove only the specified contact', async () => {
      await repository.delete('test-id');
      
      const remainingContacts = await repository.findAll();
      expect(remainingContacts).toHaveLength(1);
      expect(remainingContacts[0].id).toBe('other-id');
    });
  });

  describe('count', () => {
    it('should return 0 when no contacts exist', async () => {
      const count = await repository.count();
      expect(count).toBe(0);
    });

    it('should return correct count of contacts', async () => {
      const contacts = [
        new ContactEntity('1', 'A', 'User', '1111111111'),
        new ContactEntity('2', 'B', 'User', '2222222222'),
        new ContactEntity('3', 'C', 'User', '3333333333')
      ];
      mockLocalStorage['phonebook_contacts'] = JSON.stringify(contacts);

      const count = await repository.count();
      expect(count).toBe(3);
    });
  });

  describe('SSR compatibility', () => {
    it('should handle undefined window gracefully', async () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(async () => {
        await repository.findAll();
        await repository.findById('test');
        await repository.count();
      }).not.toThrow();

      global.window = originalWindow;
    });
  });
});