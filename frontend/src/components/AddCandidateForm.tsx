import React, { useState } from 'react';
import { candidateService } from '../services/candidateService';
import './AddCandidateForm.css';

type EduEntry  = { institution: string; degree: string; fieldOfStudy: string; startDate: string; endDate: string };
type WorkEntry = { company: string; position: string; description: string; startDate: string; endDate: string };
type Errors    = Record<string, string | string[] | undefined>;
type Props     = { onSuccess?: () => void };

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const PHONE_RE = /^\+[1-9]\d{1,14}$/;
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const mkEdu  = (): EduEntry  => ({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
const mkWork = (): WorkEntry => ({ company: '', position: '', description: '', startDate: '', endDate: '' });

export default function AddCandidateForm({ onSuccess }: Props) {
  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');
  const [address, setAddress]               = useState('');
  const [educations, setEducations]         = useState<EduEntry[]>([]);
  const [workExperiences, setWorkExperiences] = useState<WorkEntry[]>([]);
  const [cv, setCv]                         = useState<File | null>(null);
  const [errors, setErrors]                 = useState<Errors>({});
  const [loading, setLoading]               = useState(false);
  const [success, setSuccess]               = useState('');

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) { setCv(null); return; }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors(p => ({ ...p, cv: 'Only PDF and DOCX files are accepted.' })); setCv(null); return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors(p => ({ ...p, cv: 'File must be smaller than 5 MB.' })); setCv(null); return;
    }
    setErrors(p => ({ ...p, cv: undefined }));
    setCv(file);
  };

  const validate = (): boolean => {
    const e: Errors = {};
    let ok = true;
    if (!firstName.trim())       { e.firstName = 'First name is required.'; ok = false; }
    else if (firstName.length > 100) { e.firstName = 'First name must be at most 100 characters.'; ok = false; }
    if (!lastName.trim())        { e.lastName = 'Last name is required.'; ok = false; }
    else if (lastName.length > 100)  { e.lastName = 'Last name must be at most 100 characters.'; ok = false; }
    if (!email.trim())           { e.email = 'Email is required.'; ok = false; }
    else if (!EMAIL_RE.test(email))  { e.email = 'Please enter a valid email address.'; ok = false; }
    if (phone && !PHONE_RE.test(phone))   { e.phone = 'Phone must be in E.164 format (e.g. +1234567890).'; ok = false; }
    if (address && address.length > 255)  { e.address = 'Address must be at most 255 characters.'; ok = false; }

    const eduErrs = educations.map((edu, i) => {
      const m: string[] = [];
      if (!edu.institution.trim()) m.push('institution');
      if (!edu.degree.trim())      m.push('degree');
      if (!edu.startDate)          m.push('start date');
      if (m.length) ok = false;
      return m.length ? `Entry ${i + 1}: ${m.join(', ')} required.` : '';
    });
    if (eduErrs.some(x => x)) e.educations = eduErrs;

    const workErrs = workExperiences.map((w, i) => {
      const m: string[] = [];
      if (!w.company.trim())  m.push('company');
      if (!w.position.trim()) m.push('position');
      if (!w.startDate)       m.push('start date');
      if (m.length) ok = false;
      return m.length ? `Entry ${i + 1}: ${m.join(', ')} required.` : '';
    });
    if (workErrs.some(x => x)) e.workExperiences = workErrs;
    setErrors(e);
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setErrors(p => ({ ...p, general: undefined }));
    if (!validate()) return;
    const fd = new FormData();
    fd.append('firstName', firstName.trim());
    fd.append('lastName', lastName.trim());
    fd.append('email', email.trim());
    if (phone)             fd.append('phone', phone.trim());
    if (address)           fd.append('address', address.trim());
    if (educations.length)     fd.append('educations', JSON.stringify(educations));
    if (workExperiences.length) fd.append('workExperiences', JSON.stringify(workExperiences));
    if (cv)                fd.append('cv', cv);
    setLoading(true);
    try {
      await candidateService.create(fd);
      setSuccess('Candidate added successfully.');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const ae = err as { code?: string; details?: Array<{ field: string; message: string }> };
      if (ae.code === 'VALIDATION_ERROR' && ae.details) {
        const fe: Errors = {};
        ae.details.forEach(d => { fe[d.field] = d.message; });
        setErrors(fe);
      } else if (ae.code === 'CANDIDATE_ALREADY_EXISTS') {
        setErrors({ email: 'A candidate with this email already exists.' });
      } else if (ae.code === 'FILE_TOO_LARGE') {
        setErrors({ cv: 'File must be smaller than 5 MB.' });
      } else if (ae.code === 'UNSUPPORTED_FILE_TYPE') {
        setErrors({ cv: 'Only PDF and DOCX files are accepted.' });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const updEdu  = (i: number, f: keyof EduEntry,  v: string) =>
    setEducations(p => p.map((e, j) => j === i ? { ...e, [f]: v } : e));
  const updWork = (i: number, f: keyof WorkEntry, v: string) =>
    setWorkExperiences(p => p.map((w, j) => j === i ? { ...w, [f]: v } : w));

  return (
    <form className="candidate-form" onSubmit={handleSubmit} noValidate>
      <h1>Add New Candidate</h1>

      {success && <div role="alert" className="success-banner">{success}</div>}
      {errors.general && <div role="alert" className="error-banner">{errors.general as string}</div>}

      <div className="form-field">
        <label htmlFor="firstName">First Name *</label>
        <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
        {errors.firstName && <span role="alert" className="field-error">{errors.firstName as string}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="lastName">Last Name *</label>
        <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
        {errors.lastName && <span role="alert" className="field-error">{errors.lastName as string}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="email">Email *</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        {errors.email && <span role="alert" className="field-error">{errors.email as string}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        {errors.phone && <span role="alert" className="field-error">{errors.phone as string}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="address">Address (optional)</label>
        <input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} />
        {errors.address && <span role="alert" className="field-error">{errors.address as string}</span>}
      </div>

      <fieldset>
        <legend>Education</legend>
        {educations.map((edu, i) => (
          <div className="entry-block" key={i}>
            <h4>Education {i + 1}</h4>
            {Array.isArray(errors.educations) && errors.educations[i] && <span role="alert" className="field-error">{errors.educations[i]}</span>}
            <div className="form-field">
              <label htmlFor={`edu-inst-${i}`}>Institution *</label>
              <input id={`edu-inst-${i}`} type="text" value={edu.institution} onChange={e => updEdu(i, 'institution', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor={`edu-deg-${i}`}>Degree *</label>
              <input id={`edu-deg-${i}`} type="text" value={edu.degree} onChange={e => updEdu(i, 'degree', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor={`edu-fos-${i}`}>Field of Study</label>
              <input id={`edu-fos-${i}`} type="text" value={edu.fieldOfStudy} onChange={e => updEdu(i, 'fieldOfStudy', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor={`edu-sd-${i}`}>Start Date *</label>
              <input id={`edu-sd-${i}`} type="date" value={edu.startDate} onChange={e => updEdu(i, 'startDate', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor={`edu-ed-${i}`}>End Date</label>
              <input id={`edu-ed-${i}`} type="date" value={edu.endDate} onChange={e => updEdu(i, 'endDate', e.target.value)} />
            </div>
            <button type="button" className="btn btn-danger" onClick={() => setEducations(p => p.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={() => setEducations(p => [...p, mkEdu()])}>+ Add Education</button>
      </fieldset>

      <fieldset>
        <legend>Work Experience</legend>
        {workExperiences.map((w, i) => (
          <div className="entry-block" key={i}>
            <h4>Work Experience {i + 1}</h4>
            {Array.isArray(errors.workExperiences) && errors.workExperiences[i] && <span role="alert" className="field-error">{errors.workExperiences[i]}</span>}
            <div className="form-field">
              <label htmlFor={`work-co-${i}`}>Company *</label>
              <input id={`work-co-${i}`} type="text" value={w.company} onChange={e => updWork(i, 'company', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor={`work-pos-${i}`}>Position *</label>
              <input id={`work-pos-${i}`} type="text" value={w.position} onChange={e => updWork(i, 'position', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor={`work-desc-${i}`}>Description</label>
              <input id={`work-desc-${i}`} type="text" value={w.description} onChange={e => updWork(i, 'description', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor={`work-sd-${i}`}>Start Date *</label>
              <input id={`work-sd-${i}`} type="date" value={w.startDate} onChange={e => updWork(i, 'startDate', e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor={`work-ed-${i}`}>End Date</label>
              <input id={`work-ed-${i}`} type="date" value={w.endDate} onChange={e => updWork(i, 'endDate', e.target.value)} />
            </div>
            <button type="button" className="btn btn-danger" onClick={() => setWorkExperiences(p => p.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={() => setWorkExperiences(p => [...p, mkWork()])}>+ Add Work Experience</button>
      </fieldset>

      <div className="form-field">
        <label htmlFor="cv">CV (optional — PDF or DOCX, max 5 MB)</label>
        <input id="cv" type="file" accept=".pdf,.docx" onChange={handleCvChange} />
        {errors.cv && <span role="alert" className="field-error">{errors.cv as string}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Submitting…' : 'Add Candidate'}
      </button>
      {loading && <span aria-label="Loading" className="spinner">Loading…</span>}
    </form>
  );
}
