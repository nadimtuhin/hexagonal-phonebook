import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactCard } from '@/presentation/components/ContactCard';
import { ContactEntity } from '@/domain/entities/Contact';

describe('ContactCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleContact = new ContactEntity(
    'test-id',
    'John',
    'Doe',
    '1234567890',
    'john@example.com',
    '123 Main St',
    'Test contact notes'
  );

  const defaultProps = {
    contact: sampleContact,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete
  };

  describe('rendering', () => {
    it('should render contact information', () => {
      render(<ContactCard {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Test contact notes')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<ContactCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render contact with minimal information', () => {
      const minimalContact = new ContactEntity(
        'minimal-id',
        'Jane',
        'Smith',
        '9876543210'
      );

      render(<ContactCard contact={minimalContact} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('9876543210')).toBeInTheDocument();
      expect(screen.queryByText('@')).not.toBeInTheDocument(); // No email
      expect(screen.queryByText('Main St')).not.toBeInTheDocument(); // No address
    });

    it('should not render empty optional fields', () => {
      const contactWithoutOptionals = new ContactEntity(
        'no-optionals-id',
        'Bob',
        'Johnson',
        '5555551234',
        undefined, // no email
        undefined, // no address
        undefined  // no notes
      );

      render(<ContactCard contact={contactWithoutOptionals} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('5555551234')).toBeInTheDocument();
    });

    it('should render email when provided', () => {
      const contactWithEmail = new ContactEntity(
        'email-id',
        'Alice',
        'Brown',
        '1111111111',
        'alice@example.com'
      );

      render(<ContactCard contact={contactWithEmail} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });

    it('should render address when provided', () => {
      const contactWithAddress = new ContactEntity(
        'address-id',
        'Charlie',
        'Wilson',
        '2222222222',
        undefined,
        '456 Oak Avenue'
      );

      render(<ContactCard contact={contactWithAddress} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('456 Oak Avenue')).toBeInTheDocument();
    });

    it('should render notes when provided', () => {
      const contactWithNotes = new ContactEntity(
        'notes-id',
        'Diana',
        'Prince',
        '3333333333',
        undefined,
        undefined,
        'Important client - handle with care'
      );

      render(<ContactCard contact={contactWithNotes} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Important client - handle with care')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactCard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(sampleContact);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactCard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(sampleContact);
    });

    it('should not interfere with multiple clicks', async () => {
      const user = userEvent.setup();
      render(<ContactCard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(mockOnEdit).toHaveBeenCalledTimes(2);
      expect(mockOnEdit).toHaveBeenCalledWith(sampleContact);
    });
  });

  describe('styling and layout', () => {
    it('should apply correct CSS classes', () => {
      const { container } = render(<ContactCard {...defaultProps} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'shadow-md');
    });

    it('should have proper button styling', () => {
      render(<ContactCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      expect(editButton).toHaveClass('text-indigo-600');
      expect(deleteButton).toHaveClass('text-red-600');
    });
  });

  describe('content formatting', () => {
    it('should display full name correctly', () => {
      const contact = new ContactEntity(
        'format-id',
        'Mary Jane',
        'Watson-Parker',
        '4444444444'
      );

      render(<ContactCard contact={contact} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Mary Jane Watson-Parker')).toBeInTheDocument();
    });

    it('should handle special characters in contact data', () => {
      const contact = new ContactEntity(
        'special-id',
        "O'Connor",
        'Smith-Jones',
        '555-123-4567',
        'test+email@example.com',
        '123 Main St, Apt #4',
        'Notes with "quotes" and & symbols'
      );

      render(<ContactCard contact={contact} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText("O'Connor Smith-Jones")).toBeInTheDocument();
      expect(screen.getByText('555-123-4567')).toBeInTheDocument();
      expect(screen.getByText('test+email@example.com')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, Apt #4')).toBeInTheDocument();
      expect(screen.getByText('Notes with "quotes" and & symbols')).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      const contact = new ContactEntity(
        'long-id',
        'Supercalifragilisticexpialidocious',
        'Antidisestablishmentarianism',
        '1234567890',
        'verylongemailaddress@extremelylongdomainname.com',
        '1234 Very Long Street Name That Goes On And On, Apartment Number 567890',
        'This is a very long note that contains a lot of information about the contact and should still display properly in the card component without breaking the layout or causing any visual issues'
      );

      render(<ContactCard contact={contact} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Supercalifragilisticexpialidocious Antidisestablishmentarianism')).toBeInTheDocument();
      expect(screen.getByText('verylongemailaddress@extremelylongdomainname.com')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper button roles', () => {
      render(<ContactCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should have semantic heading for contact name', () => {
      render(<ContactCard {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('John Doe');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ContactCard {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // Tab to edit button and press Enter
      await user.tab();
      expect(editButton).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(mockOnEdit).toHaveBeenCalledWith(sampleContact);

      // Tab to delete button and press Enter
      await user.tab();
      expect(deleteButton).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(mockOnDelete).toHaveBeenCalledWith(sampleContact);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      const contact = new ContactEntity(
        'empty-id',
        '',
        '',
        '1234567890',
        '',
        '',
        ''
      );

      render(<ContactCard contact={contact} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      // Should still render the component without crashing
      expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('should handle contacts with only required fields', () => {
      const minimalContact = new ContactEntity(
        'minimal-id',
        'Min',
        'Contact',
        '1111111111'
      );

      render(<ContactCard contact={minimalContact} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Min Contact')).toBeInTheDocument();
      expect(screen.getByText('1111111111')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });
});