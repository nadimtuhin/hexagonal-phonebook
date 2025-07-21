import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/presentation/components/ContactForm';
import { ContactEntity } from '@/domain/entities/Contact';

describe('ContactForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel
  };

  describe('rendering', () => {
    it('should render form for new contact', () => {
      render(<ContactForm {...defaultProps} />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render form for editing existing contact', () => {
      const existingContact = new ContactEntity(
        'test-id',
        'John',
        'Doe',
        '1234567890',
        'john@example.com',
        '123 Main St',
        'Test notes'
      );

      render(<ContactForm {...defaultProps} contact={existingContact} />);

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      render(<ContactForm {...defaultProps} />);

      expect(screen.getByText('First Name *')).toBeInTheDocument();
      expect(screen.getByText('Last Name *')).toBeInTheDocument();
      expect(screen.getByText('Phone Number *')).toBeInTheDocument();
    });

    it('should render empty form when no contact provided', () => {
      render(<ContactForm {...defaultProps} />);

      expect(screen.getByLabelText(/first name/i)).toHaveValue('');
      expect(screen.getByLabelText(/last name/i)).toHaveValue('');
      expect(screen.getByLabelText(/phone number/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/address/i)).toHaveValue('');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('');
    });
  });

  describe('form interaction', () => {
    it('should update form fields when user types', async () => {
      const user = userEvent.setup();
      render(<ContactForm {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const phoneInput = screen.getByLabelText(/phone number/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(phoneInput, '1234567890');

      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
      expect(phoneInput).toHaveValue('1234567890');
    });

    it('should clear form fields', async () => {
      const user = userEvent.setup();
      render(<ContactForm {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'Test');
      expect(firstNameInput).toHaveValue('Test');

      await user.clear(firstNameInput);
      expect(firstNameInput).toHaveValue('');
    });

    it('should handle textarea input for notes', async () => {
      const user = userEvent.setup();
      render(<ContactForm {...defaultProps} />);

      const notesTextarea = screen.getByLabelText(/notes/i);
      await user.type(notesTextarea, 'This is a test note\\nWith multiple lines');

      expect(notesTextarea).toHaveValue('This is a test note\\nWith multiple lines');
    });
  });

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '1234567890',
          email: 'john@example.com',
          address: '',
          notes: ''
        });
      });
    });

    it('should submit form with minimal required data', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'Jane');
      await user.type(screen.getByLabelText(/last name/i), 'Smith');
      await user.type(screen.getByLabelText(/phone number/i), '9876543210');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '9876543210',
          email: '',
          address: '',
          notes: ''
        });
      });
    });

    it('should require first name field', async () => {
      const user = userEvent.setup();
      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');

      // Try to submit without first name
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Form should prevent submission (HTML5 validation)
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should require last name field', async () => {
      const user = userEvent.setup();
      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');

      // Try to submit without last name
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Form should prevent submission (HTML5 validation)
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should require phone number field', async () => {
      const user = userEvent.setup();
      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');

      // Try to submit without phone number
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Form should prevent submission (HTML5 validation)
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submitPromise);

      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');

      await user.click(screen.getByRole('button', { name: /create/i }));

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();

      // Resolve the promise
      resolveSubmit!();
    });
  });

  describe('error handling', () => {
    it('should display error message when submission fails', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error('Validation failed'));

      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/phone number/i), 'invalid');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText('Validation failed')).toBeInTheDocument();
      });

      // Form should remain in normal state after error
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).not.toBeDisabled();
    });

    it('should handle non-Error exceptions', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue('String error');

      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
      });
    });

    it('should clear error message when form is resubmitted', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValueOnce(new Error('First error'));
      mockOnSubmit.mockResolvedValueOnce(undefined);

      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/phone number/i), '1234567890');

      // First submission fails
      await user.click(screen.getByRole('button', { name: /create/i }));
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission succeeds
      await user.click(screen.getByRole('button', { name: /create/i }));
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('cancel functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactForm {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not submit form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should validate email format', () => {
      render(<ContactForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should validate phone number format', () => {
      render(<ContactForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<ContactForm {...defaultProps} />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<ContactForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });
});