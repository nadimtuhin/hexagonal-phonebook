import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

describe('PhoneNumber', () => {
  describe('constructor', () => {
    it('should create a phone number with valid 10-digit number', () => {
      const phoneNumber = new PhoneNumber('1234567890');
      expect(phoneNumber.toString()).toBe('1234567890');
    });

    it('should create a phone number with formatted input', () => {
      const phoneNumber = new PhoneNumber('(123) 456-7890');
      expect(phoneNumber.toString()).toBe('1234567890');
    });

    it('should create a phone number with international format', () => {
      const phoneNumber = new PhoneNumber('+1 (123) 456-7890');
      expect(phoneNumber.toString()).toBe('11234567890');
    });

    it('should create a phone number with spaces and dashes', () => {
      const phoneNumber = new PhoneNumber('123 456 7890');
      expect(phoneNumber.toString()).toBe('1234567890');
    });

    it('should create a phone number with international number', () => {
      const phoneNumber = new PhoneNumber('+44 20 7946 0958');
      expect(phoneNumber.toString()).toBe('442079460958');
    });

    it('should throw error for empty string', () => {
      expect(() => new PhoneNumber('')).toThrow('Invalid phone number format');
    });

    it('should throw error for too short number', () => {
      expect(() => new PhoneNumber('123456789')).toThrow('Invalid phone number format');
    });

    it('should throw error for too long number', () => {
      expect(() => new PhoneNumber('1234567890123456')).toThrow('Invalid phone number format');
    });

    it('should throw error for non-numeric characters', () => {
      expect(() => new PhoneNumber('123abc7890')).toThrow('Invalid phone number format');
    });

    it('should throw error for special characters (excluding allowed ones)', () => {
      expect(() => new PhoneNumber('123*456*7890')).toThrow('Invalid phone number format');
    });

    it('should accept minimum valid length (10 digits)', () => {
      const phoneNumber = new PhoneNumber('1234567890');
      expect(phoneNumber.toString()).toBe('1234567890');
    });

    it('should accept maximum valid length (15 digits)', () => {
      const phoneNumber = new PhoneNumber('123456789012345');
      expect(phoneNumber.toString()).toBe('123456789012345');
    });
  });

  describe('toString method', () => {
    it('should return normalized phone number', () => {
      const phoneNumber = new PhoneNumber('(123) 456-7890');
      expect(phoneNumber.toString()).toBe('1234567890');
    });

    it('should return same result on multiple calls', () => {
      const phoneNumber = new PhoneNumber('+1-234-567-8900');
      expect(phoneNumber.toString()).toBe('12345678900');
      expect(phoneNumber.toString()).toBe('12345678900');
    });
  });

  describe('format method', () => {
    it('should format 10-digit US number', () => {
      const phoneNumber = new PhoneNumber('1234567890');
      expect(phoneNumber.format()).toBe('(123) 456-7890');
    });

    it('should format 10-digit number from formatted input', () => {
      const phoneNumber = new PhoneNumber('(555) 123-4567');
      expect(phoneNumber.format()).toBe('(555) 123-4567');
    });

    it('should return unformatted for non-10-digit numbers', () => {
      const phoneNumber = new PhoneNumber('+1 234 567 8900');
      expect(phoneNumber.format()).toBe('12345678900');
    });

    it('should return unformatted for international numbers', () => {
      const phoneNumber = new PhoneNumber('+44 20 7946 0958');
      expect(phoneNumber.format()).toBe('442079460958');
    });

    it('should handle edge case with exactly 11 digits', () => {
      const phoneNumber = new PhoneNumber('12345678901');
      expect(phoneNumber.format()).toBe('12345678901');
    });
  });

  describe('normalization', () => {
    it('should remove all non-digit characters', () => {
      const testCases = [
        { input: '(123) 456-7890', expected: '1234567890' },
        { input: '+1-234-567-8900', expected: '12345678900' },
        { input: '123 456 7890', expected: '1234567890' },
        { input: '1 (234) 567-8900', expected: '12345678900' },
      ];

      testCases.forEach(({ input, expected }) => {
        const phoneNumber = new PhoneNumber(input);
        expect(phoneNumber.toString()).toBe(expected);
      });
    });
  });

  describe('validation edge cases', () => {
    it('should handle phone numbers with only allowed special characters', () => {
      const validInputs = [
        '(123) 456-7890',
        '+1 234 567 8900',
        '123-456-7890',
        '123 456 7890',
        '1234567890',
        '+44 (0) 20 7946 0958'
      ];

      validInputs.forEach(input => {
        expect(() => new PhoneNumber(input)).not.toThrow();
      });
    });

    it('should reject numbers with invalid special characters', () => {
      const invalidInputs = [
        '123*456*7890',
        '123#456#7890',
        '123@456@7890',
        '123&456&7890',
        '123%456%7890'
      ];

      invalidInputs.forEach(input => {
        expect(() => new PhoneNumber(input)).toThrow('Invalid phone number format');
      });
    });
  });
});