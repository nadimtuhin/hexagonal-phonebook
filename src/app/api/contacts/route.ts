import { NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@/application/services/ContactService';
import { RepositoryFactory } from '@/infrastructure/factories/RepositoryFactory';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    const repository = await RepositoryFactory.createContactRepository();
    const service = new ContactService(repository);
    
    const result = await service.listContacts(query || undefined);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const repository = await RepositoryFactory.createContactRepository();
    const service = new ContactService(repository);
    
    const contact = await service.createContact(data);
    
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}