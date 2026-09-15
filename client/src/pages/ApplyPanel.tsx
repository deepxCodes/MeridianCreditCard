import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { applicationApi } from '../services/api';
import type { CreditCardApplication } from '../types';

export const ApplyPanel: React.FC = () => {
  const { user, application, setApplication, addNotification, showToast, setActivePanel } = useAuthStore();

  const [step, setStep] = useState<number>(1);

  // Step 1: Personal
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [dob, setDob] = useState(user?.dateOfBirth || '');
  const [pan, setPan] = useState('');
  const [mobile, setMobile] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [zip, setZip] = useState(user?.zipCode || '');

  // Step 2: Employment
  const [empType, setEmpType] = useState('Salaried');
  const [employer, setEmployer] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [empDuration, setEmpDuration] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');

  // Step 3: Financial
  const [income, setIncome] = useState<string>('750000');
  const [loans, setLoans] = useState('None');
  const [cards, setCards] = useState('None');
  const [obligations, setObligations] = useState('');
  const [expenses, setExpenses] = useState('');
  const [bank, setBank] = useState('');

  // Step 4: Card Choice
  const [cardChoice, setCardChoice] = useState<'Classic' | 'Rewards' | 'Premium'>('Classic');

  // Step 5: Document Uploads (key -> filename)
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const fileInputs = {
    identity: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
    income: useRef<HTMLInputElement>(null),
    photo: useRef<HTMLInputElement>(null),
    other: useRef<HTMLInputElement>(null),
  };

  // Step 6: Review & Declarations
  const [declareTrue, setDeclareTrue] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeConsent, setAgreeConsent] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Prefill from user if available
  useEffect(() => {
    if (user) {
      if (user.fullName && !fullName) setFullName(user.fullName);
      if (user.dateOfBirth && !dob) setDob(user.dateOfBirth);
      if (user.phoneNumber && !mobile) setMobile(user.phoneNumber);
      if (user.email && !email) setEmail(user.email);
      if (user.address && !address) setAddress(user.address);
      if (user.city && !city) setCity(user.city);
      if (user.state && !state) setState(user.state);
      if (user.zipCode && !zip) setZip(user.zipCode);
    }
  }, [user]);

  // Validation functions
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const RE_MOBILE = /^[0-9]{10}$/;
  const RE_ZIP = /^[0-9]{5,6}$/;

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!dob) errs.dob = 'Date of birth is required.';
    if (!pan.trim()) errs.pan = 'Tax identification number is required.';
    if (!mobile.trim()) errs.mobile = 'Mobile number is required.';
    else if (!RE_MOBILE.test(mobile.trim())) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!RE_EMAIL.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!address.trim()) errs.address = 'Residential address is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!state.trim()) errs.state = 'State is required.';
    if (!zip.trim()) errs.zip = 'PIN/ZIP code is required.';
    else if (!RE_ZIP.test(zip.trim())) errs.zip = 'Enter a valid PIN/ZIP code.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!empType) errs.empType = 'Select an employment type.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!income || Number(income) <= 0) errs.income = 'Enter a valid annual income.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!cardChoice) errs.card = 'Please select a card to continue.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep5 = () => {
    const errs: Record<string, string> = {};
    const mandatory = ['identity', 'address', 'income'];
    const missing = mandatory.filter((k) => !uploads[k]);
    if (missing.length > 0) {
      errs.docs = `Please upload all mandatory documents: ${missing.join(', ')}.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep6 = () => {
    const errs: Record<string, string> = {};
    if (!declareTrue || !agreeTerms || !agreeConsent) {
      errs.declarations = 'Please confirm all declarations before submitting.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    const validators: Record<number, () => boolean> = {
      1: validateStep1,
      2: validateStep2,
      3: validateStep3,
      4: validateStep4,
      5: validateStep5,
    };
    const fn = validators[step];
    if (fn && !fn()) return;
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleFileUpload = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, docs: `File "${file.name}" exceeds the 5 MB limit.` }));
      e.target.value = '';
      return;
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.docs;
      return copy;
    });

    setUploads((prev) => ({ ...prev, [docKey]: file.name }));

    // Proactively upload file to server if possible
    applicationApi.uploadDocument(file, docKey).catch(() => {});
  };

  const handleRemoveDoc = (docKey: string) => {
    setUploads((prev) => {
      const copy = { ...prev };
      delete copy[docKey];
      return copy;
    });
    if (fileInputs[docKey as keyof typeof fileInputs]?.current) {
      fileInputs[docKey as keyof typeof fileInputs].current!.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep6()) return;

    setSubmitting(true);
    const id = 'MC-' + Math.floor(100000 + Math.random() * 899999);
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const payload = {
      fullName: fullName.trim(),
      dateOfBirth: dob,
      taxIdNumber: pan.trim(),
      mobileNumber: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zip.trim(),
      employmentType: empType,
      employerName: employer.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      workExperience: experience || undefined,
      employmentDuration: empDuration.trim() || undefined,
      officeAddress: officeAddress.trim() || undefined,
      annualIncome: Number(income),
      existingLoans: loans,
      existingCards: cards,
      monthlyObligations: obligations ? Number(obligations) : undefined,
      estimatedExpenses: expenses ? Number(expenses) : undefined,
      primaryBankAccountLast4: bank.trim() || undefined,
      selectedCardType: cardChoice,
      identityDocName: uploads.identity,
      addressDocName: uploads.address,
      incomeDocName: uploads.income,
      photoDocName: uploads.photo,
      otherDocName: uploads.other,
    };

    try {
      const savedApp = await applicationApi.submit(payload);
      setApplication(savedApp);
    } catch (error) {
      console.error("Application submission failed:", error);
      alert("Application submission failed. Check the browser console for the error.");
    }
    
    addNotification(
      'Application received',
      `Your application ${application?.applicationReference || id} has been received and queued for document verification.`
    );
    showToast('Application submitted successfully');
    setSubmitting(false);
    setActivePanel('confirmation');
    window.scrollTo(0, 0);
  };

  return (
    <section id="panel-apply" className="panel active">
      {/* 6-STEP PERSISTENT STEPPER */}
      <div className="stepper" id="appStepper">
        <div className={`stepper-item ${step === 1 ? 'is-active' : step > 1 ? 'is-done' : ''}`} data-step="1">
          <span className="stepper-num">1</span>
          <span className="stepper-label">Personal</span>
        </div>
        <div className={`stepper-item ${step === 2 ? 'is-active' : step > 2 ? 'is-done' : ''}`} data-step="2">
          <span className="stepper-num">2</span>
          <span className="stepper-label">Employment</span>
        </div>
        <div className={`stepper-item ${step === 3 ? 'is-active' : step > 3 ? 'is-done' : ''}`} data-step="3">
          <span className="stepper-num">3</span>
          <span className="stepper-label">Financial</span>
        </div>
        <div className={`stepper-item ${step === 4 ? 'is-active' : step > 4 ? 'is-done' : ''}`} data-step="4">
          <span className="stepper-num">4</span>
          <span className="stepper-label">Card</span>
        </div>
        <div className={`stepper-item ${step === 5 ? 'is-active' : step > 5 ? 'is-done' : ''}`} data-step="5">
          <span className="stepper-num">5</span>
          <span className="stepper-label">Documents</span>
        </div>
        <div className={`stepper-item ${step === 6 ? 'is-active' : ''}`} data-step="6">
          <span className="stepper-num">6</span>
          <span className="stepper-label">Review</span>
        </div>
      </div>

      <form className="card app-form" id="applyForm" onSubmit={handleSubmit} noValidate>
        {/* STEP 1: PERSONAL */}
        {step === 1 && (
          <fieldset className="app-step" data-astep="1">
            <legend className="section-legend">Personal information</legend>
            <div className="field-grid two">
              <div className="field">
                <label htmlFor="a-fullName">
                  Full name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="a-fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? 'invalid' : fullName ? 'valid' : ''}
                />
                <p className={`error-msg ${errors.fullName ? 'show' : ''}`}>{errors.fullName}</p>
              </div>
              <div className="field">
                <label htmlFor="a-dob">
                  Date of birth <span className="req">*</span>
                </label>
                <input
                  type="date"
                  id="a-dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={errors.dob ? 'invalid' : dob ? 'valid' : ''}
                />
                <p className={`error-msg ${errors.dob ? 'show' : ''}`}>{errors.dob}</p>
              </div>
            </div>
            <div className="field-grid two">
              <div className="field">
                <label htmlFor="a-pan">
                  Tax identification number (PAN) <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="a-pan"
                  placeholder="e.g. ABCDE1234F"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className={errors.pan ? 'invalid' : pan ? 'valid' : ''}
                />
                <p className={`error-msg ${errors.pan ? 'show' : ''}`}>{errors.pan}</p>
              </div>
              <div className="field">
                <label htmlFor="a-mobile">
                  Mobile number <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  id="a-mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={errors.mobile ? 'invalid' : mobile ? 'valid' : ''}
                />
                <p className={`error-msg ${errors.mobile ? 'show' : ''}`}>{errors.mobile}</p>
              </div>
            </div>
            <div className="field">
              <label htmlFor="a-email">
                Email <span className="req">*</span>
              </label>
              <input
                type="email"
                id="a-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'invalid' : email ? 'valid' : ''}
              />
              <p className={`error-msg ${errors.email ? 'show' : ''}`}>{errors.email}</p>
            </div>
            <div className="field">
              <label htmlFor="a-address">
                Residential address <span className="req">*</span>
              </label>
              <input
                type="text"
                id="a-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={errors.address ? 'invalid' : address ? 'valid' : ''}
              />
              <p className={`error-msg ${errors.address ? 'show' : ''}`}>{errors.address}</p>
            </div>
            <div className="field-grid three">
              <div className="field">
                <label htmlFor="a-city">
                  City <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="a-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={errors.city ? 'invalid' : city ? 'valid' : ''}
                />
                <p className={`error-msg ${errors.city ? 'show' : ''}`}>{errors.city}</p>
              </div>
              <div className="field">
                <label htmlFor="a-state">
                  State <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="a-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={errors.state ? 'invalid' : state ? 'valid' : ''}
                />
                <p className={`error-msg ${errors.state ? 'show' : ''}`}>{errors.state}</p>
              </div>
              <div className="field">
                <label htmlFor="a-zip">
                  PIN / ZIP code <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="a-zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className={errors.zip ? 'invalid' : zip ? 'valid' : ''}
                />
                <p className={`error-msg ${errors.zip ? 'show' : ''}`}>{errors.zip}</p>
              </div>
            </div>
          </fieldset>
        )}

        {/* STEP 2: EMPLOYMENT */}
        {step === 2 && (
          <fieldset className="app-step" data-astep="2">
            <legend className="section-legend">Employment information</legend>
            <div className="field">
              <label htmlFor="a-empType">
                Employment type <span className="req">*</span>
              </label>
              <select id="a-empType" value={empType} onChange={(e) => setEmpType(e.target.value)}>
                <option value="">Select employment type</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Student">Student</option>
                <option value="Retired">Retired</option>
                <option value="Other">Other</option>
              </select>
              <p className={`error-msg ${errors.empType ? 'show' : ''}`}>{errors.empType}</p>
            </div>
            <div className="field-grid two">
              <div className="field">
                <label htmlFor="a-employer">Employer / company name</label>
                <input type="text" id="a-employer" value={employer} onChange={(e) => setEmployer(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="a-jobTitle">Job title</label>
                <input type="text" id="a-jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
            </div>
            <div className="field-grid two">
              <div className="field">
                <label htmlFor="a-experience">Work experience</label>
                <select id="a-experience" value={experience} onChange={(e) => setExperience(e.target.value)}>
                  <option value="">Select range</option>
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1–3 years">1–3 years</option>
                  <option value="3–5 years">3–5 years</option>
                  <option value="5–10 years">5–10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="a-empDuration">Employment duration (current employer)</label>
                <input
                  type="text"
                  id="a-empDuration"
                  placeholder="e.g. 2 years 4 months"
                  value={empDuration}
                  onChange={(e) => setEmpDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="a-officeAddress">Office address</label>
              <input
                type="text"
                id="a-officeAddress"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
              />
            </div>
          </fieldset>
        )}

        {/* STEP 3: FINANCIAL */}
        {step === 3 && (
          <fieldset className="app-step" data-astep="3">
            <legend className="section-legend">Financial information</legend>
            <div className="field">
              <label htmlFor="a-income">
                Annual income <span className="req">*</span>
              </label>
              <input
                type="number"
                id="a-income"
                placeholder="Amount in INR (e.g. 750000)"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className={errors.income ? 'invalid' : income ? 'valid' : ''}
              />
              <p className={`error-msg ${errors.income ? 'show' : ''}`}>{errors.income}</p>
            </div>
            <div className="field-grid two">
              <div className="field">
                <label htmlFor="a-loans">Existing loans</label>
                <select id="a-loans" value={loans} onChange={(e) => setLoans(e.target.value)}>
                  <option value="None">None</option>
                  <option value="Home loan">Home loan</option>
                  <option value="Auto loan">Auto loan</option>
                  <option value="Personal loan">Personal loan</option>
                  <option value="Education loan">Education loan</option>
                  <option value="Multiple loans">Multiple loans</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="a-cards">Existing credit cards</label>
                <select id="a-cards" value={cards} onChange={(e) => setCards(e.target.value)}>
                  <option value="None">None</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3 or more">3 or more</option>
                </select>
              </div>
            </div>
            <div className="field-grid two">
              <div className="field">
                <label htmlFor="a-obligations">Monthly financial obligations</label>
                <input
                  type="number"
                  id="a-obligations"
                  placeholder="EMIs, rent, etc."
                  value={obligations}
                  onChange={(e) => setObligations(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="a-expenses">Estimated monthly expenses</label>
                <input
                  type="number"
                  id="a-expenses"
                  placeholder="Living expenses"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="a-bank">Primary bank account (last 4 digits)</label>
              <input
                type="text"
                id="a-bank"
                maxLength={4}
                placeholder="1234"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              />
              <p className="hint-msg">Only used to link disbursals — full account details are never requested here.</p>
            </div>
          </fieldset>
        )}

        {/* STEP 4: CARD SELECTION */}
        {step === 4 && (
          <fieldset className="app-step" data-astep="4">
            <legend className="section-legend">Choose your card</legend>
            <p className={`error-msg ${errors.card ? 'show' : ''}`}>{errors.card}</p>
            <div className="card-select-grid" id="cardSelectGrid">
              <label className="card-option">
                <input
                  type="radio"
                  name="cardChoice"
                  value="Classic"
                  checked={cardChoice === 'Classic'}
                  onChange={() => setCardChoice('Classic')}
                />
                <div className="card-option-body">
                  <span className="card-option-name">Classic Card</span>
                  <span className="card-option-fee">Annual fee: ₹0</span>
                  <ul className="card-option-list">
                    <li>Credit limit: ₹25,000 – ₹1,00,000</li>
                    <li>1% cashback on all spends</li>
                    <li>Interest rate: 3.5% per month</li>
                    <li>Eligibility: Annual income ₹2,50,000+</li>
                  </ul>
                </div>
              </label>
              <label className="card-option">
                <input
                  type="radio"
                  name="cardChoice"
                  value="Rewards"
                  checked={cardChoice === 'Rewards'}
                  onChange={() => setCardChoice('Rewards')}
                />
                <div className="card-option-body">
                  <span className="card-option-name">Rewards Card</span>
                  <span className="card-option-fee">Annual fee: ₹499</span>
                  <ul className="card-option-list">
                    <li>Credit limit: ₹75,000 – ₹3,00,000</li>
                    <li>5x reward points on dining &amp; travel</li>
                    <li>Interest rate: 3.2% per month</li>
                    <li>Eligibility: Annual income ₹5,00,000+</li>
                  </ul>
                </div>
              </label>
              <label className="card-option">
                <input
                  type="radio"
                  name="cardChoice"
                  value="Premium"
                  checked={cardChoice === 'Premium'}
                  onChange={() => setCardChoice('Premium')}
                />
                <div className="card-option-body">
                  <span className="card-option-name">Premium Card</span>
                  <span className="card-option-fee">Annual fee: ₹1,999</span>
                  <ul className="card-option-list">
                    <li>Credit limit: ₹2,00,000 – ₹10,00,000</li>
                    <li>Airport lounge access + concierge</li>
                    <li>Interest rate: 2.9% per month</li>
                    <li>Eligibility: Annual income ₹12,00,000+</li>
                  </ul>
                </div>
              </label>
            </div>
          </fieldset>
        )}

        {/* STEP 5: DOCUMENTS */}
        {step === 5 && (
          <fieldset className="app-step" data-astep="5">
            <legend className="section-legend">Document upload</legend>
            <p className="hint-msg">Accepted formats: PDF, JPG, PNG. Maximum file size: 5 MB per document.</p>

            <div className="upload-list" id="uploadList">
              {/* Identity Proof */}
              <div className="upload-row" data-doc="identity">
                <div className="upload-info">
                  <span className="upload-name">
                    Identity proof <span className="req">*</span>
                  </span>
                  <span className={`upload-status ${uploads.identity ? 'status-ok' : ''}`}>
                    {uploads.identity ? `Uploaded: ${uploads.identity} — Verification pending` : 'Not uploaded'}
                  </span>
                </div>
                <div className="upload-actions">
                  <input
                    type="file"
                    className="upload-input"
                    ref={fileInputs.identity}
                    hidden
                    onChange={(e) => handleFileUpload('identity', e)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputs.identity.current?.click()}
                  >
                    Choose file
                  </button>
                  {uploads.identity && (
                    <button
                      type="button"
                      className="btn btn-text btn-sm"
                      onClick={() => handleRemoveDoc('identity')}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Address Proof */}
              <div className="upload-row" data-doc="address">
                <div className="upload-info">
                  <span className="upload-name">
                    Address proof <span className="req">*</span>
                  </span>
                  <span className={`upload-status ${uploads.address ? 'status-ok' : ''}`}>
                    {uploads.address ? `Uploaded: ${uploads.address} — Verification pending` : 'Not uploaded'}
                  </span>
                </div>
                <div className="upload-actions">
                  <input
                    type="file"
                    className="upload-input"
                    ref={fileInputs.address}
                    hidden
                    onChange={(e) => handleFileUpload('address', e)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputs.address.current?.click()}
                  >
                    Choose file
                  </button>
                  {uploads.address && (
                    <button
                      type="button"
                      className="btn btn-text btn-sm"
                      onClick={() => handleRemoveDoc('address')}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Income Proof */}
              <div className="upload-row" data-doc="income">
                <div className="upload-info">
                  <span className="upload-name">
                    Income proof <span className="req">*</span>
                  </span>
                  <span className={`upload-status ${uploads.income ? 'status-ok' : ''}`}>
                    {uploads.income ? `Uploaded: ${uploads.income} — Verification pending` : 'Not uploaded'}
                  </span>
                </div>
                <div className="upload-actions">
                  <input
                    type="file"
                    className="upload-input"
                    ref={fileInputs.income}
                    hidden
                    onChange={(e) => handleFileUpload('income', e)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputs.income.current?.click()}
                  >
                    Choose file
                  </button>
                  {uploads.income && (
                    <button
                      type="button"
                      className="btn btn-text btn-sm"
                      onClick={() => handleRemoveDoc('income')}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Photo */}
              <div className="upload-row" data-doc="photo">
                <div className="upload-info">
                  <span className="upload-name">Photograph</span>
                  <span className={`upload-status ${uploads.photo ? 'status-ok' : ''}`}>
                    {uploads.photo ? `Uploaded: ${uploads.photo} — Verification pending` : 'Not uploaded'}
                  </span>
                </div>
                <div className="upload-actions">
                  <input
                    type="file"
                    className="upload-input"
                    ref={fileInputs.photo}
                    hidden
                    onChange={(e) => handleFileUpload('photo', e)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputs.photo.current?.click()}
                  >
                    Choose file
                  </button>
                  {uploads.photo && (
                    <button
                      type="button"
                      className="btn btn-text btn-sm"
                      onClick={() => handleRemoveDoc('photo')}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Other doc */}
              <div className="upload-row" data-doc="other">
                <div className="upload-info">
                  <span className="upload-name">Other supporting document</span>
                  <span className={`upload-status ${uploads.other ? 'status-ok' : ''}`}>
                    {uploads.other ? `Uploaded: ${uploads.other} — Verification pending` : 'Not uploaded'}
                  </span>
                </div>
                <div className="upload-actions">
                  <input
                    type="file"
                    className="upload-input"
                    ref={fileInputs.other}
                    hidden
                    onChange={(e) => handleFileUpload('other', e)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputs.other.current?.click()}
                  >
                    Choose file
                  </button>
                  {uploads.other && (
                    <button
                      type="button"
                      className="btn btn-text btn-sm"
                      onClick={() => handleRemoveDoc('other')}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className={`error-msg ${errors.docs ? 'show' : ''}`}>{errors.docs}</p>
          </fieldset>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {step === 6 && (
          <fieldset className="app-step" data-astep="6">
            <legend className="section-legend">Review &amp; submit</legend>
            <div className="review-summary" id="reviewSummary">
              {/* Personal */}
              <div className="review-block">
                <div className="review-block-title">
                  Personal information{' '}
                  <button type="button" onClick={() => setStep(1)}>
                    Edit
                  </button>
                </div>
                <div className="review-rows">
                  <div className="review-row">
                    <span>Full name</span>
                    <span>{fullName}</span>
                  </div>
                  <div className="review-row">
                    <span>Date of birth</span>
                    <span>{dob}</span>
                  </div>
                  <div className="review-row">
                    <span>Tax ID</span>
                    <span>{pan}</span>
                  </div>
                  <div className="review-row">
                    <span>Mobile</span>
                    <span>{mobile}</span>
                  </div>
                  <div className="review-row">
                    <span>Email</span>
                    <span>{email}</span>
                  </div>
                  <div className="review-row">
                    <span>City / State</span>
                    <span>
                      {city}, {state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div className="review-block">
                <div className="review-block-title">
                  Employment information{' '}
                  <button type="button" onClick={() => setStep(2)}>
                    Edit
                  </button>
                </div>
                <div className="review-rows">
                  <div className="review-row">
                    <span>Employment type</span>
                    <span>{empType || '—'}</span>
                  </div>
                  <div className="review-row">
                    <span>Employer</span>
                    <span>{employer || '—'}</span>
                  </div>
                  <div className="review-row">
                    <span>Job title</span>
                    <span>{jobTitle || '—'}</span>
                  </div>
                  <div className="review-row">
                    <span>Experience</span>
                    <span>{experience || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Financial */}
              <div className="review-block">
                <div className="review-block-title">
                  Financial information{' '}
                  <button type="button" onClick={() => setStep(3)}>
                    Edit
                  </button>
                </div>
                <div className="review-rows">
                  <div className="review-row">
                    <span>Annual income</span>
                    <span>₹{Number(income || 0).toLocaleString()}</span>
                  </div>
                  <div className="review-row">
                    <span>Existing loans</span>
                    <span>{loans}</span>
                  </div>
                  <div className="review-row">
                    <span>Existing cards</span>
                    <span>{cards}</span>
                  </div>
                  <div className="review-row">
                    <span>Monthly obligations</span>
                    <span>{obligations ? `₹${Number(obligations).toLocaleString()}` : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Card Choice */}
              <div className="review-block">
                <div className="review-block-title">
                  Card selection{' '}
                  <button type="button" onClick={() => setStep(4)}>
                    Edit
                  </button>
                </div>
                <div className="review-rows">
                  <div className="review-row">
                    <span>Selected card</span>
                    <span>{cardChoice} Card</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="review-block">
                <div className="review-block-title">
                  Documents{' '}
                  <button type="button" onClick={() => setStep(5)}>
                    Edit
                  </button>
                </div>
                <div className="review-rows">
                  {Object.keys(uploads).length > 0 ? (
                    Object.entries(uploads).map(([k, v]) => (
                      <div key={k} className="review-row">
                        <span style={{ textTransform: 'capitalize' }}>{k}</span>
                        <span>{v}</span>
                      </div>
                    ))
                  ) : (
                    <div className="review-row">
                      <span>Documents</span>
                      <span>None uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <label className="checkbox-line block">
              <input
                type="checkbox"
                id="a-declare"
                checked={declareTrue}
                onChange={(e) => setDeclareTrue(e.target.checked)}
              />
              <span>
                I declare that the information provided is true and complete <span className="req">*</span>
              </span>
            </label>
            <label className="checkbox-line block">
              <input
                type="checkbox"
                id="a-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the Terms and Conditions <span className="req">*</span>
              </span>
            </label>
            <label className="checkbox-line block">
              <input
                type="checkbox"
                id="a-consent"
                checked={agreeConsent}
                onChange={(e) => setAgreeConsent(e.target.checked)}
              />
              <span>
                I consent to a credit verification check <span className="req">*</span>
              </span>
            </label>
            <p className={`error-msg ${errors.declarations ? 'show' : ''}`}>{errors.declarations}</p>
          </fieldset>
        )}

        <div className="form-nav">
          {step > 1 && (
            <button type="button" className="btn btn-ghost" id="appBack" onClick={handleBack}>
              Back
            </button>
          )}
          <span className="form-nav-spacer"></span>
          {step < 6 ? (
            <button type="button" className="btn btn-primary" id="appNext" onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" id="appSubmit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit credit card application'}
            </button>
          )}
        </div>
      </form>
    </section>
  );
};
