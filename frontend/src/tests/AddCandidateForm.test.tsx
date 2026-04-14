import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCandidateForm from '../components/AddCandidateForm';
import { candidateService } from '../services/candidateService';

jest.mock('../services/candidateService', () => ({
  candidateService: { create: jest.fn() },
}));

const mockCreate = candidateService.create as jest.Mock;

const MOCK_CANDIDATE = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  educations: [],
  workExperiences: [],
  createdAt: new Date().toISOString(),
};

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText(/last name/i),  { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText(/email/i),      { target: { value: 'john@example.com' } });
}

/** Waits for the form to settle after any async submit (loading → idle). */
async function waitForFormIdle() {
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /add candidate/i })).not.toBeDisabled()
  );
}

beforeEach(() => mockCreate.mockReset());

describe('AddCandidateForm', () => {
  test('renders all form fields: firstName, lastName, email, phone, address, cv', () => {
    render(<AddCandidateForm />);
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cv/i)).toBeInTheDocument();
  });

  test('shows inline error on firstName when form is submitted empty', async () => {
    render(<AddCandidateForm />);
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
  });

  test('shows inline error on lastName when form is submitted empty', async () => {
    render(<AddCandidateForm />);
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    expect(await screen.findByText(/last name is required/i)).toBeInTheDocument();
  });

  test('shows inline error on email when form is submitted empty', async () => {
    render(<AddCandidateForm />);
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  test('shows inline error on email when format is invalid', async () => {
    render(<AddCandidateForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'notanemail' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i),  { target: { value: 'Doe' } });
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  test('shows CV file error when selected file exceeds 5 MB', () => {
    render(<AddCandidateForm />);
    const bigContent = new Uint8Array(6 * 1024 * 1024);
    const file = new File([bigContent], 'big.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/cv/i), { target: { files: [file] } });
    expect(screen.getByText(/smaller than 5 mb/i)).toBeInTheDocument();
  });

  test('shows CV file error when selected file type is not PDF or DOCX', () => {
    render(<AddCandidateForm />);
    const file = new File(['content'], 'resume.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText(/cv/i), { target: { files: [file] } });
    expect(screen.getByText(/only pdf and docx/i)).toBeInTheDocument();
  });

  test('calls candidateService.create() with FormData on valid submit', async () => {
    mockCreate.mockResolvedValue(MOCK_CANDIDATE);
    render(<AddCandidateForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledWith(expect.any(FormData));
    await waitForFormIdle(); // let setSuccess + setLoading(false) settle
  });

  test('disables submit button and shows spinner while request is in flight', async () => {
    let resolveCreate!: (v: typeof MOCK_CANDIDATE) => void;
    mockCreate.mockReturnValue(new Promise(resolve => { resolveCreate = resolve; }));
    render(<AddCandidateForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });
    resolveCreate(MOCK_CANDIDATE);
    await waitForFormIdle();
  });

  test('displays success banner "Candidate added successfully." after a 201 response', async () => {
    mockCreate.mockResolvedValue(MOCK_CANDIDATE);
    render(<AddCandidateForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    expect(await screen.findByText(/candidate added successfully/i)).toBeInTheDocument();
    await waitForFormIdle();
  });

  test('displays CANDIDATE_ALREADY_EXISTS message on email field after 409 response', async () => {
    mockCreate.mockRejectedValue({ code: 'CANDIDATE_ALREADY_EXISTS' });
    render(<AddCandidateForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    expect(await screen.findByText(/candidate with this email already exists/i)).toBeInTheDocument();
    await waitForFormIdle();
  });

  test('displays generic error banner after a 500 response', async () => {
    mockCreate.mockRejectedValue({ code: 'INTERNAL_SERVER_ERROR' });
    render(<AddCandidateForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /add candidate/i }));
    expect(await screen.findByText(/unexpected error occurred/i)).toBeInTheDocument();
    await waitForFormIdle();
  });
});
