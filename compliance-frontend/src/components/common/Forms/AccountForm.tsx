import React from 'react';
import { FormBuilder } from './FormBuilder';
import type { FormFieldConfig } from './FormBuilder';
import type { Account } from '../../../services/accountsService';

interface AccountFormProps {
  initialData?: Partial<Account>;
  onSubmit?: (data: Partial<Account>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'create' | 'edit';
}

export const AccountForm: React.FC<AccountFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  mode = 'create',
}) => {
  const fields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Account Name',
      type: 'text',
      required: true,
      placeholder: 'Enter account name',
      helperText: 'Full name of the account holder',
      grid: { xs: 12, sm: 6 },
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      name: 'accountNumber',
      label: 'Account Number',
      type: 'text',
      required: true,
      placeholder: 'Enter account number',
      helperText: 'Unique account identifier',
      grid: { xs: 12, sm: 6 },
      validation: {
        pattern: /^[A-Z0-9-]{5,20}$/,
        custom: (value: string) => {
          if (value && !/^[A-Z0-9-]{5,20}$/.test(value)) {
            return 'Account number must be 5-20 characters, uppercase letters, numbers, and hyphens only';
          }
          return null;
        },
      },
    },
    {
      name: 'type',
      label: 'Account Type',
      type: 'select',
      required: true,
      helperText: 'Select the type of account',
      grid: { xs: 12, sm: 6 },
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' },
        { label: 'Corporate', value: 'corporate' },
        { label: 'Government', value: 'government' },
        { label: 'Non-Profit', value: 'nonprofit' },
      ],
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: false,
      placeholder: '+1 (555) 123-4567',
      helperText: 'Primary contact phone number',
      grid: { xs: 12, sm: 6 },
      validation: {
        pattern: /^\+?[\d\s\-\(\)]+$/,
        custom: (value: string) => {
          if (value && value.replace(/\D/g, '').length < 10) {
            return 'Phone number must contain at least 10 digits';
          }
          return null;
        },
      },
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: false,
      placeholder: 'account@example.com',
      helperText: 'Primary contact email address',
      grid: { xs: 12, sm: 6 },
    },
    {
      name: 'billingAddressId',
      label: 'Billing Address ID',
      type: 'text',
      required: false,
      placeholder: 'Enter billing address ID',
      helperText: 'Reference to billing address record',
      grid: { xs: 12, sm: 6 },
    },
    {
      name: 'inHouse',
      label: 'In-House Account',
      type: 'checkbox',
      required: false,
      helperText: 'Check if this is an internal account',
      grid: { xs: 12, sm: 6 },
    },
    {
      name: 'mdvitaDisenrollment',
      label: 'MDVITA Disenrollment',
      type: 'checkbox',
      required: false,
      helperText: 'Check if account has MDVITA disenrollment',
      grid: { xs: 12, sm: 6 },
    },
    {
      name: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Enter any additional notes about this account...',
      helperText: 'Internal notes and comments',
      grid: { xs: 12 },
      validation: {
        maxLength: 1000,
      },
    },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    // Transform form values to Account data
    const accountData: Partial<Account> = {
      name: values.name,
      accountNumber: values.accountNumber,
      type: values.type,
      phone: values.phone || undefined,
      billingAddressId: values.billingAddressId || null,
      inHouse: Boolean(values.inHouse),
      mdvitaDisenrollment: Boolean(values.mdvitaDisenrollment),
    };

    if (onSubmit) {
      await onSubmit(accountData);
    }
  };

  return (
    <FormBuilder
      title={mode === 'create' ? 'Create New Account' : 'Edit Account'}
      subtitle={mode === 'create'
        ? 'Fill in the details to create a new account'
        : 'Update the account information below'
      }
      fields={fields}
      initialValues={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitLabel={mode === 'create' ? 'Create Account' : 'Update Account'}
      cancelLabel="Cancel"
      showCancelButton={!!onCancel}
      loading={loading}
      disabled={disabled}
    />
  );
};

export default AccountForm;