import { NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@/application/services/ContactService';
import { RepositoryFactory } from '@/infrastructure/factories/RepositoryFactory';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const repository = await RepositoryFactory.createContactRepository();
    const service = new ContactService(repository);
    
    const contact = await service.getContact(params.id);
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    
    if (error instanceof Error && error.message === 'Contact not found') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const data = await request.json();
    
    const repository = await RepositoryFactory.createContactRepository();
    const service = new ContactService(repository);
    
    const contact = await service.updateContact(params.id, data);
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Contact not found') {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const repository = await RepositoryFactory.createContactRepository();
    const service = new ContactService(repository);
    
    await service.deleteContact(params.id);
    
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error('Error deleting contact:', error);
    
    if (error instanceof Error && error.message === 'Contact not found') {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}