'use client';

import { Contact } from '@/domain/entities/Contact';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const avatarColors = [
    'from-indigo-400 to-purple-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-blue-500',
    'from-yellow-400 to-orange-500',
    'from-pink-400 to-red-500',
    'from-teal-400 to-green-500',
  ];
  
  const colorIndex = (contact.firstName.charCodeAt(0) + contact.lastName.charCodeAt(0)) % avatarColors.length;
  const avatarGradient = avatarColors[colorIndex];

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-white/50">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start">
        <div className="flex-1 w-full">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${avatarGradient} rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg mr-3 sm:mr-4 shadow-lg`}>
              {contact.firstName.charAt(0).toUpperCase()}{contact.lastName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {contact.firstName} {contact.lastName}
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                <p className="text-gray-500 text-sm font-medium">Active Contact</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-800">{contact.phoneNumber}</span>
            </div>
            
            {contact.email && (
              <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{contact.email}</span>
              </div>
            )}
            
            {contact.address && (
              <div className="flex items-start p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{contact.address}</span>
              </div>
            )}
            
            {contact.notes && (
              <div className="flex items-start p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 italic">&ldquo;{contact.notes}&rdquo;</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col space-x-3 sm:space-x-0 sm:space-y-3 mt-4 sm:mt-0 sm:ml-6 w-full sm:w-auto">
          <button
            onClick={() => onEdit(contact)}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-1 sm:flex-none"
          >
            <svg className="h-4 w-4 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex-1 sm:flex-none"
          >
            <svg className="h-4 w-4 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}