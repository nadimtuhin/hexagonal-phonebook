import { ContactEntity } from '@/domain/entities/Contact';

describe('ContactEntity', () => {
  const testDate = new Date('2024-01-01T00:00:00.000Z');
  
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(testDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create a contact with required fields', () => {
      const contact = new ContactEntity(
        '1',
        'John',
        'Doe',
        '1234567890'
      );

      expect(contact.id).toBe('1');
      expect(contact.firstName).toBe('John');
      expect(contact.lastName).toBe('Doe');
      expect(contact.phoneNumber).toBe('1234567890');
      expect(contact.email).toBeUndefined();
      expect(contact.address).toBeUndefined();
      expect(contact.notes).toBeUndefined();
      expect(contact.createdAt).toEqual(testDate);
      expect(contact.updatedAt).toEqual(testDate);
    });

    it('should create a contact with all fields', () => {
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-06-01');
      
      const contact = new ContactEntity(
        '1',
        'John',
        'Doe',
        '1234567890',
        'john@example.com',
        '123 Main St',
        'Friend from work',
        createdAt,
        updatedAt
      );

      expect(contact.id).toBe('1');
      expect(contact.firstName).toBe('John');
      expect(contact.lastName).toBe('Doe');
      expect(contact.phoneNumber).toBe('1234567890');
      expect(contact.email).toBe('john@example.com');
      expect(contact.address).toBe('123 Main St');
      expect(contact.notes).toBe('Friend from work');
      expect(contact.createdAt).toEqual(createdAt);
      expect(contact.updatedAt).toEqual(updatedAt);
    });
  });

  describe('fullName getter', () => {
    it('should return concatenated first and last name', () => {
      const contact = new ContactEntity(
        '1',
        'John',
        'Doe',
        '1234567890'
      );

      expect(contact.fullName).toBe('John Doe');
    });

    it('should handle names with spaces', () => {
      const contact = new ContactEntity(
        '1',
        'Mary Jane',
        'Watson-Parker',
        '1234567890'
      );

      expect(contact.fullName).toBe('Mary Jane Watson-Parker');
    });
  });

  describe('update method', () => {
    let contact: ContactEntity;

    beforeEach(() => {
      contact = new ContactEntity(
        '1',
        'John',
        'Doe',
        '1234567890',
        'john@example.com',
        '123 Main St',
        'Original notes',
        new Date('2023-01-01'),
        new Date('2023-01-01')
      );
    });

    it('should update single field', () => {
      contact.update({ firstName: 'Jane' });

      expect(contact.firstName).toBe('Jane');
      expect(contact.lastName).toBe('Doe');
      expect(contact.phoneNumber).toBe('1234567890');
      expect(contact.updatedAt).toEqual(testDate);
    });

    it('should update multiple fields', () => {
      contact.update({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      });

      expect(contact.firstName).toBe('Jane');
      expect(contact.lastName).toBe('Smith');
      expect(contact.email).toBe('jane@example.com');
      expect(contact.phoneNumber).toBe('1234567890');
      expect(contact.updatedAt).toEqual(testDate);
    });

    it('should update all optional fields', () => {
      contact.update({
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '9876543210',
        email: 'jane@example.com',
        address: '456 Oak Ave',
        notes: 'Updated notes'
      });

      expect(contact.firstName).toBe('Jane');
      expect(contact.lastName).toBe('Smith');
      expect(contact.phoneNumber).toBe('9876543210');
      expect(contact.email).toBe('jane@example.com');
      expect(contact.address).toBe('456 Oak Ave');
      expect(contact.notes).toBe('Updated notes');
      expect(contact.updatedAt).toEqual(testDate);
    });

    it('should not update id or createdAt', () => {
      const originalCreatedAt = contact.createdAt;
      
      contact.update({
        firstName: 'Jane',
        lastName: 'Smith'
      });

      expect(contact.id).toBe('1');
      expect(contact.createdAt).toEqual(originalCreatedAt);
      expect(contact.updatedAt).toEqual(testDate);
    });

    it('should handle undefined values', () => {
      contact.update({
        email: undefined,
        address: undefined,
        notes: undefined
      });

      expect(contact.email).toBeUndefined();
      expect(contact.address).toBeUndefined();
      expect(contact.notes).toBeUndefined();
      expect(contact.updatedAt).toEqual(testDate);
    });

    it('should handle empty object update', () => {
      const originalUpdatedAt = contact.updatedAt;
      
      contact.update({});

      expect(contact.firstName).toBe('John');
      expect(contact.lastName).toBe('Doe');
      expect(contact.updatedAt).toEqual(testDate);
      expect(contact.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});