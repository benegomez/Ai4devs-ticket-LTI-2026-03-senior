const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3010';

export type Education = {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
};

export type WorkExperience = {
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
};

export type Candidate = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cvFileName?: string;
  educations: Education[];
  workExperiences: WorkExperience[];
  createdAt: string;
};

export const candidateService = {
  /**
   * Creates a new candidate via POST /candidates.
   * formData must NOT set Content-Type manually — the browser sets the
   * multipart boundary automatically when body is a FormData instance.
   */
  create: async (formData: FormData): Promise<Candidate> => {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json();
      // Backend wraps errors as { success, error: { code, message, details } }
      // Throw the inner error object so callers can read .code / .details directly
      throw body.error ?? body;
    }

    const result = await response.json();
    return result.data as Candidate;
  },
};
