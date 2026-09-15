import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api';
import type { User } from '../types';

export const AuthShell: React.FC = () => {
  const { authScreen, setAuthScreen, setAuth, showToast } = useAuthStore();

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpDemo, setOtpDemo] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration form state
  const [regStep, setRegStep] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [username, setUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [captchaNum1, setCaptchaNum1] = useState(5);
  const [captchaNum2, setCaptchaNum2] = useState(3);
  const [captchaInput, setCaptchaInput] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regSuccessBanner, setRegSuccessBanner] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<number>(1);
  const [forgotContact, setForgotContact] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotErrors, setForgotErrors] = useState<Record<string, string>>({});
  const [forgotLoading, setForgotLoading] = useState(false);

  // Generate math captcha
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptchaNum1(a);
    setCaptchaNum2(b);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Password strength
  const getPasswordStrengthScore = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrengthScore(regPassword);
  const strengthWidth = (strengthScore / 4) * 100;
  const strengthColor = strengthScore <= 1 ? 'var(--danger)' : strengthScore <= 2 ? 'var(--warning)' : 'var(--success)';

  // Validation regexes
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const RE_MOBILE = /^[0-9]{10}$/;
  const RE_ZIP = /^[0-9]{5,6}$/;

  /* ================== LOGIN HANDLER ================== */
  const handleSendOtp = () => {
    setOtpSent(true);
    showToast('OTP sent (demo code: 123456)');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    setLoginError(null);

    if (!loginId.trim()) errors.loginId = 'Username or email is required.';
    if (!loginPassword) errors.loginPassword = 'Password is required.';
    setLoginErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (otpSent && otpDemo.trim() && otpDemo.trim() !== '123456') {
      setLoginError('Incorrect OTP. Please re-enter the 6-digit code.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await authApi.login(loginId.trim(), loginPassword);
      setLoginLoading(false);
      showToast('Logged in successfully');
      setAuth(res.user, res.accessToken);
    } catch {
      // Local fallback account simulation for demo
      const savedUserStr = localStorage.getItem('demo_account');
      if (savedUserStr) {
        const demoUser = JSON.parse(savedUserStr);
        if (
          (loginId.trim().toLowerCase() === demoUser.email?.toLowerCase() ||
           loginId.trim().toLowerCase() === demoUser.username?.toLowerCase()) &&
          loginPassword === demoUser.password
        ) {
          setLoginLoading(false);
          showToast('Logged in successfully');
          setAuth(demoUser, 'demo-jwt-token');
          return;
        }
      }

      // Default demo login check
      if (loginId.trim() === 'jane.doe@email.com' && loginPassword === 'Password@123') {
        const mockUser: User = {
          id: 1,
          fullName: 'Jane Doe',
          email: 'jane.doe@email.com',
          username: 'janedoe',
          dateOfBirth: '1995-06-15',
          gender: 'Female',
          phoneNumber: '9876543210',
          address: '42 Park Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          role: 'Customer',
          isEmailVerified: true,
          lastLoginAt: new Date().toISOString(),
        };
        setLoginLoading(false);
        showToast('Logged in successfully');
        setAuth(mockUser, 'demo-jwt-token');
        return;
      }

      setLoginLoading(false);
      setLoginError('Incorrect username/email or password.');
    }
  };

  /* ================== REGISTRATION HANDLER ================== */
  const validateRegStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!dob) errs.dob = 'Date of birth is required.';
    if (!mobile.trim()) errs.mobile = 'Mobile number is required.';
    else if (!RE_MOBILE.test(mobile.trim())) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!RE_EMAIL.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!address.trim()) errs.address = 'Residential address is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!state.trim()) errs.state = 'State is required.';
    if (!zip.trim()) errs.zip = 'PIN/ZIP code is required.';
    else if (!RE_ZIP.test(zip.trim())) errs.zip = 'Enter a valid PIN/ZIP code.';

    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegStep2 = () => {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = 'Username is required.';
    if (!regPassword) errs.password = 'Password is required.';
    else if (regPassword.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!confirmPassword) errs.confirmPassword = 'Confirm your password.';
    else if (confirmPassword !== regPassword) errs.confirmPassword = 'Passwords do not match.';

    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegStep3 = () => {
    const errs: Record<string, string> = {};
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaInput, 10) !== expected) {
      errs.captcha = 'Incorrect answer. Please try again.';
    }
    if (!agreeTerms) errs.agreeTerms = 'You must accept the Terms and Conditions.';
    if (!agreePrivacy) errs.agreePrivacy = 'You must acknowledge the Privacy Policy.';

    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccessBanner(null);

    if (regStep === 1) {
      if (validateRegStep1()) {
        setRegStep(2);
      }
      return;
    }
    if (regStep === 2) {
      if (validateRegStep2()) {
        setRegStep(3);
      }
      return;
    }
    if (regStep === 3) {
      if (!validateRegStep3()) return;

      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password: regPassword,
        phoneNumber: mobile.trim(),
        dateOfBirth: dob,
        gender,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zip.trim(),
        role: 'Customer',
      };

      setRegLoading(true);
      try {
        await authApi.register(payload);
      } catch {
        // Fallback store demo account in localStorage
        const demoAcct = { ...payload, isEmailVerified: true };
        localStorage.setItem('demo_account', JSON.stringify(demoAcct));
      }

      setRegLoading(false);
      setRegSuccessBanner('Account created successfully. Redirecting to login…');
      showToast('Account created — please log in');
      setTimeout(() => {
        setLoginId(username.trim() || email.trim());
        setAuthScreen('login');
      }, 900);
    }
  };

  const handleRegReset = () => {
    setFullName('');
    setDob('');
    setGender('');
    setMobile('');
    setEmail('');
    setAddress('');
    setCity('');
    setState('');
    setZip('');
    setUsername('');
    setRegPassword('');
    setConfirmPassword('');
    setAgreeTerms(false);
    setAgreePrivacy(false);
    setRegErrors({});
    generateCaptcha();
    setRegStep(1);
  };

  /* ================== FORGOT PASSWORD HANDLER ================== */
  const handleForgotSendOtp = async () => {
    const errs: Record<string, string> = {};
    if (!forgotContact.trim()) {
      errs.forgotContact = 'Enter your registered email or mobile.';
      setForgotErrors(errs);
      return;
    }
    setForgotErrors({});
    setForgotLoading(true);
    try {
      await authApi.sendForgotPasswordOtp(forgotContact.trim());
    } catch {
      // ignore
    }
    setForgotLoading(false);
    setForgotStep(2);
    showToast('Verification code sent (demo code: 123456)');
  };

  const handleForgotVerifyOtp = () => {
    const errs: Record<string, string> = {};
    if (forgotOtp.trim() !== '123456') {
      errs.forgotOtp = 'Incorrect code. Please try again.';
      setForgotErrors(errs);
      return;
    }
    setForgotErrors({});
    setForgotStep(3);
  };

  const handleForgotSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!newPassword || newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters.';
    if (confirmNewPassword !== newPassword) errs.confirmNewPassword = 'Passwords do not match.';

    if (Object.keys(errs).length > 0) {
      setForgotErrors(errs);
      return;
    }

    setForgotLoading(true);
    try {
      await authApi.resetPassword(forgotContact.trim(), forgotOtp.trim(), newPassword);
    } catch {
      // update local demo account if exists
      const savedUserStr = localStorage.getItem('demo_account');
      if (savedUserStr) {
        const demoUser = JSON.parse(savedUserStr);
        demoUser.password = newPassword;
        localStorage.setItem('demo_account', JSON.stringify(demoUser));
      }
    }
    setForgotLoading(false);
    showToast('Password updated. Please log in.');
    setLoginId(forgotContact.trim());
    setAuthScreen('login');
  };

  /* ================== RENDER SCREEN ================== */
  return (
    <>
      {/* ===================== LOGIN SCREEN ===================== */}
      {authScreen === 'login' && (
        <section id="screen-login" className="screen auth-shell active">
          <div className="auth-side">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true"></span>
              <span className="brand-name">Meridian Credit</span>
            </div>
            <h1 className="auth-hero-title">Credit, structured clearly.</h1>
            <p className="auth-hero-sub">
              A single ledger for your application, your documents, and your decision — from first form to card in hand.
            </p>
            <ul className="auth-hero-points">
              <li>Bank-grade document handling</li>
              <li>Six-stage transparent review timeline</li>
              <li>Average decision time: 3–5 business days</li>
            </ul>
          </div>
          <div className="auth-main">
            <form className="card auth-card" id="loginForm" onSubmit={handleLogin} noValidate>
              <h2 className="auth-title">Log in</h2>
              <p className="auth-subtitle">Access your Meridian Credit account</p>

              <div className="field">
                <label htmlFor="loginId">
                  Username or Email <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="loginId"
                  name="loginId"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="jane.doe@email.com"
                  autoComplete="username"
                  className={loginErrors.loginId ? 'invalid' : loginId ? 'valid' : ''}
                />
                <p className={`error-msg ${loginErrors.loginId ? 'show' : ''}`} id="err-loginId">
                  {loginErrors.loginId}
                </p>
              </div>

              <div className="field">
                <label htmlFor="loginPassword">
                  Password <span className="req">*</span>
                </label>
                <div className="input-with-action">
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    id="loginPassword"
                    name="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={loginErrors.loginPassword ? 'invalid' : loginPassword ? 'valid' : ''}
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    aria-label={showLoginPass ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className={`error-msg ${loginErrors.loginPassword ? 'show' : ''}`} id="err-loginPassword">
                  {loginErrors.loginPassword}
                </p>
              </div>

              <div className="field-row between">
                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="btn-text"
                  style={{ padding: 0 }}
                  id="linkForgotPassword"
                  onClick={() => {
                    setForgotStep(1);
                    setAuthScreen('forgot');
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {loginError && (
                <div className="banner banner-error" id="loginErrorBanner">
                  {loginError}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={loginLoading}>
                {loginLoading ? 'Logging in…' : 'Log in'}
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="field">
                <label htmlFor="otpDemo" className="label-optional">
                  One-time passcode (MFA demo)
                </label>
                <div className="otp-row">
                  <input
                    type="text"
                    id="otpDemo"
                    maxLength={6}
                    placeholder="6-digit code"
                    inputMode="numeric"
                    value={otpDemo}
                    onChange={(e) => setOtpDemo(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" id="btnSendOtp" onClick={handleSendOtp}>
                    Send code
                  </button>
                </div>
                <p className="hint-msg" id="otpHint">
                  {otpSent ? 'Code sent. Demo code: 123456' : ''}
                </p>
              </div>

              <p className="auth-switch">
                New to Meridian Credit?{' '}
                <a
                  href="#register"
                  id="linkGoRegister"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthScreen('register');
                  }}
                >
                  Create an account
                </a>
              </p>
            </form>
          </div>
        </section>
      )}

      {/* ===================== REGISTRATION SCREEN ===================== */}
      {authScreen === 'register' && (
        <section id="screen-register" className="screen auth-shell active">
          <div className="auth-side">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true"></span>
              <span className="brand-name">Meridian Credit</span>
            </div>
            <h1 className="auth-hero-title">Open your account in three short steps.</h1>
            <p className="auth-hero-sub">
              We split registration into focused sections so no single screen asks too much at once.
            </p>
            <div className="reg-rail" id="regRail">
              <div className={`reg-rail-item ${regStep === 1 ? 'is-active' : regStep > 1 ? 'is-done' : ''}`} data-rail="1">
                <span className="reg-rail-num">01</span>
                <span className="reg-rail-text">Personal information</span>
              </div>
              <div className={`reg-rail-item ${regStep === 2 ? 'is-active' : regStep > 2 ? 'is-done' : ''}`} data-rail="2">
                <span className="reg-rail-num">02</span>
                <span className="reg-rail-text">Account credentials</span>
              </div>
              <div className={`reg-rail-item ${regStep === 3 ? 'is-active' : ''}`} data-rail="3">
                <span className="reg-rail-num">03</span>
                <span className="reg-rail-text">Security &amp; consent</span>
              </div>
            </div>
          </div>

          <div className="auth-main">
            <form className="card auth-card wide" id="registerForm" onSubmit={handleRegSubmit} noValidate>
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">
                Section <span id="regStepLabel">{regStep}</span> of 3
              </p>

              {/* REG STEP 1 */}
              {regStep === 1 && (
                <fieldset className="reg-section" data-step="1">
                  <legend className="section-legend">Personal information</legend>

                  <div className="field">
                    <label htmlFor="fullName">
                      Full name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      placeholder="As per government ID"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={regErrors.fullName ? 'invalid' : fullName ? 'valid' : ''}
                    />
                    <p className={`error-msg ${regErrors.fullName ? 'show' : ''}`} id="err-fullName">
                      {regErrors.fullName}
                    </p>
                  </div>

                  <div className="field-grid two">
                    <div className="field">
                      <label htmlFor="dob">
                        Date of birth <span className="req">*</span>
                      </label>
                      <input
                        type="date"
                        id="dob"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={regErrors.dob ? 'invalid' : dob ? 'valid' : ''}
                      />
                      <p className={`error-msg ${regErrors.dob ? 'show' : ''}`} id="err-dob">
                        {regErrors.dob}
                      </p>
                    </div>
                    <div className="field">
                      <label htmlFor="gender">Gender</label>
                      <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Prefer not to say</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-grid two">
                    <div className="field">
                      <label htmlFor="mobile">
                        Mobile number <span className="req">*</span>
                      </label>
                      <input
                        type="tel"
                        id="mobile"
                        placeholder="10-digit mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className={regErrors.mobile ? 'invalid' : mobile ? 'valid' : ''}
                      />
                      <p className={`error-msg ${regErrors.mobile ? 'show' : ''}`} id="err-mobile">
                        {regErrors.mobile}
                      </p>
                    </div>
                    <div className="field">
                      <label htmlFor="email">
                        Email address <span className="req">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={regErrors.email ? 'invalid' : email ? 'valid' : ''}
                      />
                      <p className={`error-msg ${regErrors.email ? 'show' : ''}`} id="err-email">
                        {regErrors.email}
                      </p>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="address">
                      Residential address <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      placeholder="Street, flat, building"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={regErrors.address ? 'invalid' : address ? 'valid' : ''}
                    />
                    <p className={`error-msg ${regErrors.address ? 'show' : ''}`} id="err-address">
                      {regErrors.address}
                    </p>
                  </div>

                  <div className="field-grid three">
                    <div className="field">
                      <label htmlFor="city">
                        City <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={regErrors.city ? 'invalid' : city ? 'valid' : ''}
                      />
                      <p className={`error-msg ${regErrors.city ? 'show' : ''}`} id="err-city">
                        {regErrors.city}
                      </p>
                    </div>
                    <div className="field">
                      <label htmlFor="state">
                        State <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={regErrors.state ? 'invalid' : state ? 'valid' : ''}
                      />
                      <p className={`error-msg ${regErrors.state ? 'show' : ''}`} id="err-state">
                        {regErrors.state}
                      </p>
                    </div>
                    <div className="field">
                      <label htmlFor="zip">
                        PIN / ZIP code <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        id="zip"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className={regErrors.zip ? 'invalid' : zip ? 'valid' : ''}
                      />
                      <p className={`error-msg ${regErrors.zip ? 'show' : ''}`} id="err-zip">
                        {regErrors.zip}
                      </p>
                    </div>
                  </div>
                </fieldset>
              )}

              {/* REG STEP 2 */}
              {regStep === 2 && (
                <fieldset className="reg-section" data-step="2">
                  <legend className="section-legend">Account credentials</legend>

                  <div className="field">
                    <label htmlFor="username">
                      Username <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      placeholder="e.g. janedoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={regErrors.username ? 'invalid' : username ? 'valid' : ''}
                    />
                    <p className={`error-msg ${regErrors.username ? 'show' : ''}`} id="err-username">
                      {regErrors.username}
                    </p>
                  </div>

                  <div className="field">
                    <label htmlFor="password">
                      Password <span className="req">*</span>
                    </label>
                    <div className="input-with-action">
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        id="password"
                        placeholder="Min. 8 characters with upper, number, symbol"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className={regErrors.password ? 'invalid' : regPassword ? 'valid' : ''}
                      />
                      <button
                        type="button"
                        className="input-action"
                        onClick={() => setShowRegPass(!showRegPass)}
                        aria-label="Toggle password"
                      >
                        {showRegPass ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="strength-meter">
                      <span id="strengthBar" style={{ width: `${strengthWidth}%`, background: strengthColor }}></span>
                    </div>
                    <p className={`error-msg ${regErrors.password ? 'show' : ''}`} id="err-password">
                      {regErrors.password}
                    </p>
                  </div>

                  <div className="field">
                    <label htmlFor="confirmPassword">
                      Confirm password <span className="req">*</span>
                    </label>
                    <div className="input-with-action">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        id="confirmPassword"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={regErrors.confirmPassword ? 'invalid' : confirmPassword ? 'valid' : ''}
                      />
                      <button
                        type="button"
                        className="input-action"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        aria-label="Toggle confirm password"
                      >
                        {showConfirmPass ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className={`error-msg ${regErrors.confirmPassword ? 'show' : ''}`} id="err-confirmPassword">
                      {regErrors.confirmPassword}
                    </p>
                  </div>
                </fieldset>
              )}

              {/* REG STEP 3 */}
              {regStep === 3 && (
                <fieldset className="reg-section" data-step="3">
                  <legend className="section-legend">Security &amp; consent</legend>

                  <div className="field">
                    <label htmlFor="captcha">
                      Human verification <span className="req">*</span>
                    </label>
                    <div className="captcha-box">
                      <span className="captcha-question" id="captchaQuestion">
                        {captchaNum1} + {captchaNum2} = ?
                      </span>
                      <input
                        type="number"
                        id="captcha"
                        placeholder="Enter the answer"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                      />
                    </div>
                    <p className={`error-msg ${regErrors.captcha ? 'show' : ''}`} id="err-captcha">
                      {regErrors.captcha}
                    </p>
                  </div>

                  <label className="checkbox-line block">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>
                      I agree to the <a href="#terms" className="link-muted" onClick={(e) => e.preventDefault()}>Terms and Conditions</a> <span className="req">*</span>
                    </span>
                  </label>
                  <p className={`error-msg ${regErrors.agreeTerms ? 'show' : ''}`} id="err-agreeTerms">
                    {regErrors.agreeTerms}
                  </p>

                  <label className="checkbox-line block">
                    <input
                      type="checkbox"
                      id="agreePrivacy"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                    />
                    <span>
                      I acknowledge the <a href="#privacy" className="link-muted" onClick={(e) => e.preventDefault()}>Privacy Policy</a> <span className="req">*</span>
                    </span>
                  </label>
                  <p className={`error-msg ${regErrors.agreePrivacy ? 'show' : ''}`} id="err-agreePrivacy">
                    {regErrors.agreePrivacy}
                  </p>
                </fieldset>
              )}

              {regSuccessBanner && (
                <div className="banner banner-success" id="regSuccessBanner">
                  {regSuccessBanner}
                </div>
              )}

              <div className="form-nav">
                {regStep > 1 && (
                  <button type="button" className="btn btn-ghost" id="regBack" onClick={() => setRegStep(regStep - 1)}>
                    Back
                  </button>
                )}
                <button type="button" className="btn btn-text" id="regReset" onClick={handleRegReset}>
                  Clear form
                </button>
                <button type="submit" className="btn btn-primary" id="regNext" disabled={regLoading}>
                  {regStep === 3 ? (regLoading ? 'Creating…' : 'Create account') : 'Continue'}
                </button>
              </div>

              <p className="auth-switch">
                Already have an account?{' '}
                <a
                  href="#login"
                  id="linkGoLogin"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthScreen('login');
                  }}
                >
                  Log in
                </a>
              </p>
            </form>
          </div>
        </section>
      )}

      {/* ===================== FORGOT PASSWORD SCREEN ===================== */}
      {authScreen === 'forgot' && (
        <section id="screen-forgot" className="screen auth-shell active">
          <div className="auth-side">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true"></span>
              <span className="brand-name">Meridian Credit</span>
            </div>
            <h1 className="auth-hero-title">Reset your password securely.</h1>
            <p className="auth-hero-sub">We verify your identity with a one-time code before allowing any change.</p>
          </div>
          <div className="auth-main">
            <form className="card auth-card" id="forgotForm" noValidate onSubmit={(e) => e.preventDefault()}>
              <h2 className="auth-title">Forgot password</h2>
              <p className="auth-subtitle" id="forgotStepLabel">
                {forgotStep === 1 && 'Step 1 of 3 — Verify your identity'}
                {forgotStep === 2 && 'Step 2 of 3 — Enter verification code'}
                {forgotStep === 3 && 'Step 3 of 3 — Set a new password'}
              </p>

              {forgotStep === 1 && (
                <div className="forgot-step" data-fstep="1">
                  <div className="field">
                    <label htmlFor="forgotContact">
                      Registered email or mobile <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="forgotContact"
                      placeholder="you@email.com"
                      value={forgotContact}
                      onChange={(e) => setForgotContact(e.target.value)}
                      className={forgotErrors.forgotContact ? 'invalid' : forgotContact ? 'valid' : ''}
                    />
                    <p className={`error-msg ${forgotErrors.forgotContact ? 'show' : ''}`} id="err-forgotContact">
                      {forgotErrors.forgotContact}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    id="forgotSendOtp"
                    onClick={handleForgotSendOtp}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Sending…' : 'Send verification code'}
                  </button>
                </div>
              )}

              {forgotStep === 2 && (
                <div className="forgot-step" data-fstep="2">
                  <div className="field">
                    <label htmlFor="forgotOtp">
                      Enter 6-digit code <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="forgotOtp"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="000000"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      className={forgotErrors.forgotOtp ? 'invalid' : forgotOtp ? 'valid' : ''}
                    />
                    <p className="hint-msg">Demo code: 123456</p>
                    <p className={`error-msg ${forgotErrors.forgotOtp ? 'show' : ''}`} id="err-forgotOtp">
                      {forgotErrors.forgotOtp}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    id="forgotVerifyOtp"
                    onClick={handleForgotVerifyOtp}
                  >
                    Verify code
                  </button>
                </div>
              )}

              {forgotStep === 3 && (
                <div className="forgot-step" data-fstep="3">
                  <div className="field">
                    <label htmlFor="newPassword">
                      New password <span className="req">*</span>
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={forgotErrors.newPassword ? 'invalid' : newPassword ? 'valid' : ''}
                    />
                    <p className={`error-msg ${forgotErrors.newPassword ? 'show' : ''}`} id="err-newPassword">
                      {forgotErrors.newPassword}
                    </p>
                  </div>
                  <div className="field">
                    <label htmlFor="confirmNewPassword">
                      Confirm new password <span className="req">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={forgotErrors.confirmNewPassword ? 'invalid' : confirmNewPassword ? 'valid' : ''}
                    />
                    <p className={`error-msg ${forgotErrors.confirmNewPassword ? 'show' : ''}`} id="err-confirmNewPassword">
                      {forgotErrors.confirmNewPassword}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    id="forgotSubmit"
                    onClick={handleForgotSubmit}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              )}

              <p className="auth-switch">
                Remembered it?{' '}
                <a
                  href="#login"
                  id="linkForgotToLogin"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthScreen('login');
                  }}
                >
                  Back to log in
                </a>
              </p>
            </form>
          </div>
        </section>
      )}
    </>
  );
};
