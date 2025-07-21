'use client';

import { useState, useEffect, useCallback } from 'react';
import { Contact } from '@/domain/entities/Contact';
import { ContactForm } from '@/presentation/components/ContactForm';
import { ContactList } from '@/presentation/components/ContactList';

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [error, setError] = useState('');

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = searchQuery 
        ? `/api/contacts?q=${encodeURIComponent(searchQuery)}`
        : '/api/contacts';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch contacts');
      
      const data = await response.json();
      setContacts(data.contacts);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCreateContact = async (data: { firstName: string; lastName: string; phoneNumber: string; email?: string; address?: string; notes?: string }) => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create contact');
    }

    setShowForm(false);
    fetchContacts();
  };

  const handleUpdateContact = async (data: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string; address?: string; notes?: string }) => {
    if (!editingContact) return;

    const response = await fetch(`/api/contacts/${editingContact.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update contact');
    }

    setEditingContact(undefined);
    setShowForm(false);
    fetchContacts();
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm(`Delete ${contact.firstName} ${contact.lastName}?`)) return;

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete contact');
      
      fetchContacts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}
      ></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4 sm:mb-6">
            My Phonebook
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            A modern contact management system built with <span className="font-semibold text-indigo-600">hexagonal architecture</span>
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showForm && (
          <>
            {/* Search and Add Section */}
            <div className="max-w-4xl mx-auto mb-8 sm:mb-10 px-4 sm:px-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl leading-5 bg-white/50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Contact
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-4xl mx-auto mb-8 sm:mb-10 px-4 sm:px-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{total}</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Total Contacts</p>
                    </div>
                  </div>
                </div>
                
                {searchQuery && (
                  <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                          <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{contacts.length}</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Search Results</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto">
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full"></div>
                  </div>
                  <p className="mt-6 text-lg font-medium text-gray-600">Loading your contacts...</p>
                  <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
                </div>
              ) : (
                <ContactList
                  contacts={contacts}
                  onEdit={handleEdit}
                  onDelete={handleDeleteContact}
                />
              )}
            </div>
          </>
        )}

        {showForm && (
          <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
              <div className="flex items-start sm:items-center mb-6 sm:mb-8">
                <button
                  onClick={handleCancel}
                  className="mr-3 sm:mr-4 p-2 sm:p-3 text-gray-400 rounded-xl flex-shrink-0"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                    {editingContact ? 'Edit Contact' : 'New Contact'}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    {editingContact ? 'Update contact information' : 'Add a new contact to your phonebook'}
                  </p>
                </div>
              </div>
              <ContactForm
                contact={editingContact}
                onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
