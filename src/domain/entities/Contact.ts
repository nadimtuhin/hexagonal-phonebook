export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContactEntity implements Contact {
  constructor(
    public id: string,
    public firstName: string,
    public lastName: string,
    public phoneNumber: string,
    public email?: string,
    public address?: string,
    public notes?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  update(data: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}