export class PhoneNumber {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid phone number format');
    }
    this.value = this.normalize(value);
  }

  private isValid(value: string): boolean {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    const digits = value.replace(/\D/g, '');
    return phoneRegex.test(value) && digits.length >= 10 && digits.length <= 15;
  }

  private normalize(value: string): string {
    return value.replace(/\D/g, '');
  }

  toString(): string {
    return this.value;
  }

  format(): string {
    const digits = this.value;
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return this.value;
  }
}