import { ContactRepository } from '@/domain/repositories/ContactRepository';
import { CreateContactUseCase } from '../use-cases/CreateContact';
import { UpdateContactUseCase } from '../use-cases/UpdateContact';
import { DeleteContactUseCase } from '../use-cases/DeleteContact';
import { GetContactUseCase } from '../use-cases/GetContact';
import { ListContactsUseCase } from '../use-cases/ListContacts';

export class ContactService {
  private readonly createContactUseCase: CreateContactUseCase;
  private readonly updateContactUseCase: UpdateContactUseCase;
  private readonly deleteContactUseCase: DeleteContactUseCase;
  private readonly getContactUseCase: GetContactUseCase;
  private readonly listContactsUseCase: ListContactsUseCase;

  constructor(contactRepository: ContactRepository) {
    this.createContactUseCase = new CreateContactUseCase(contactRepository);
    this.updateContactUseCase = new UpdateContactUseCase(contactRepository);
    this.deleteContactUseCase = new DeleteContactUseCase(contactRepository);
    this.getContactUseCase = new GetContactUseCase(contactRepository);
    this.listContactsUseCase = new ListContactsUseCase(contactRepository);
  }

  createContact = (data: Parameters<CreateContactUseCase['execute']>[0]) => 
    this.createContactUseCase.execute(data);
  
  updateContact = (id: string, data: Parameters<UpdateContactUseCase['execute']>[1]) => 
    this.updateContactUseCase.execute(id, data);
  
  deleteContact = (id: string) => 
    this.deleteContactUseCase.execute(id);
  
  getContact = (id: string) => 
    this.getContactUseCase.execute(id);
  
  listContacts = (searchQuery?: string) => 
    this.listContactsUseCase.execute(searchQuery);
}