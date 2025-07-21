import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactList } from '@/presentation/components/ContactList';
import { ContactEntity } from '@/domain/entities/Contact';

describe('ContactList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleContacts = [
    new ContactEntity(
      'contact-1',
      'John',
      'Doe',
      '1234567890',
      'john@example.com',
      '123 Main St',
      'First contact'
    ),
    new ContactEntity(
      'contact-2',
      'Jane',
      'Smith',
      '9876543210',
      'jane@example.com',
      '456 Oak Ave',
      'Second contact'
    ),
    new ContactEntity(
      'contact-3',
      'Bob',
      'Johnson',
      '5555551234',
      'bob@example.com'
    )
  ];

  const defaultProps = {
    contacts: sampleContacts,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete
  };

  describe('rendering', () => {
    it('should render all contacts', () => {
      render(<ContactList {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should render contact phone numbers', () => {
      render(<ContactList {...defaultProps} />);

      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('9876543210')).toBeInTheDocument();
      expect(screen.getByText('5555551234')).toBeInTheDocument();
    });

    it('should render contact emails', () => {
      render(<ContactList {...defaultProps} />);

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('should render edit and delete buttons for each contact', () => {
      render(<ContactList {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });

    it('should use grid layout for contact cards', () => {
      const { container } = render(<ContactList {...defaultProps} />);

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass('grid', 'gap-4', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('empty state', () => {
    it('should show empty state when no contacts provided', () => {
      render(<ContactList contacts={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('No contacts found')).toBeInTheDocument();
    });

    it('should center empty state message', () => {
      const { container } = render(<ContactList contacts={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const emptyState = container.firstChild as HTMLElement;
      expect(emptyState).toHaveClass('text-center', 'py-12');
    });

    it('should not render grid when no contacts', () => {
      const { container } = render(<ContactList contacts={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(container.querySelector('.grid')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactList {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(sampleContacts[0]);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[1]);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(sampleContacts[1]);
    });

    it('should handle interactions with different contacts', async () => {
      const user = userEvent.setup();
      render(<ContactList {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

      // Click edit on second contact
      await user.click(editButtons[1]);
      expect(mockOnEdit).toHaveBeenCalledWith(sampleContacts[1]);

      // Click delete on third contact
      await user.click(deleteButtons[2]);
      expect(mockOnDelete).toHaveBeenCalledWith(sampleContacts[2]);
    });
  });

  describe('contact rendering order', () => {
    it('should render contacts in provided order', () => {
      render(<ContactList {...defaultProps} />);

      const contactCards = screen.getAllByRole('heading', { level: 3 });
      
      expect(contactCards[0]).toHaveTextContent('John Doe');
      expect(contactCards[1]).toHaveTextContent('Jane Smith');
      expect(contactCards[2]).toHaveTextContent('Bob Johnson');
    });

    it('should maintain order with different contact arrangements', () => {
      const reversedContacts = [...sampleContacts].reverse();
      
      render(<ContactList contacts={reversedContacts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const contactCards = screen.getAllByRole('heading', { level: 3 });
      
      expect(contactCards[0]).toHaveTextContent('Bob Johnson');
      expect(contactCards[1]).toHaveTextContent('Jane Smith');
      expect(contactCards[2]).toHaveTextContent('John Doe');
    });
  });

  describe('single contact', () => {
    it('should render single contact correctly', () => {
      const singleContact = [sampleContacts[0]];
      
      render(<ContactList contacts={singleContact} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(1);
    });
  });

  describe('many contacts', () => {
    it('should handle large number of contacts', () => {
      const manyContacts = Array.from({ length: 50 }, (_, index) => 
        new ContactEntity(
          `contact-${index}`,
          `First${index}`,
          `Last${index}`,
          `${1000000000 + index}`,
          `user${index}@example.com`
        )
      );

      render(<ContactList contacts={manyContacts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('First0 Last0')).toBeInTheDocument();
      expect(screen.getByText('First49 Last49')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(50);
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(50);
    });
  });

  describe('contact data variations', () => {
    it('should handle contacts with minimal data', () => {
      const minimalContacts = [
        new ContactEntity('min-1', 'Min', 'One', '1111111111'),
        new ContactEntity('min-2', 'Min', 'Two', '2222222222')
      ];

      render(<ContactList contacts={minimalContacts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Min One')).toBeInTheDocument();
      expect(screen.getByText('Min Two')).toBeInTheDocument();
      expect(screen.getByText('1111111111')).toBeInTheDocument();
      expect(screen.getByText('2222222222')).toBeInTheDocument();
    });

    it('should handle contacts with all fields populated', () => {
      const fullContacts = [
        new ContactEntity(
          'full-1',
          'Full',
          'Contact',
          '9999999999',
          'full@example.com',
          '789 Full Street',
          'Complete contact information'
        )
      ];

      render(<ContactList contacts={fullContacts} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByText('Full Contact')).toBeInTheDocument();
      expect(screen.getByText('9999999999')).toBeInTheDocument();
      expect(screen.getByText('full@example.com')).toBeInTheDocument();
      expect(screen.getByText('789 Full Street')).toBeInTheDocument();
      expect(screen.getByText('Complete contact information')).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should apply responsive grid classes', () => {
      const { container } = render(<ContactList {...defaultProps} />);

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass('md:grid-cols-2');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('accessibility', () => {
    it('should have proper structure for screen readers', () => {
      render(<ContactList {...defaultProps} />);

      const contactHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(contactHeadings).toHaveLength(3);
    });

    it('should maintain tab order for buttons', async () => {
      const user = userEvent.setup();
      render(<ContactList {...defaultProps} />);

      const allButtons = screen.getAllByRole('button');
      expect(allButtons).toHaveLength(6); // 3 edit + 3 delete buttons

      // Tab through buttons in order
      await user.tab();
      expect(allButtons[0]).toHaveFocus(); // First edit button
      
      await user.tab();
      expect(allButtons[1]).toHaveFocus(); // First delete button
      
      await user.tab();
      expect(allButtons[2]).toHaveFocus(); // Second edit button
    });
  });

  describe('edge cases', () => {
    it('should handle undefined contacts array gracefully', () => {
      expect(() => {
        render(<ContactList contacts={undefined as any} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
      }).toThrow();
    });

  });
});