import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/userContext';
import { handleFormSubmit } from './formUtils';
import './UserForms.scss';

const handleChange = (e, setFormData) => {
  setFormData((prevFormData) => ({ ...prevFormData, [e.target.name]: e.target.value }));
};

const handleFileChange = (e, setFormData) => {
  setFormData((prevFormData) => ({ ...prevFormData, [e.target.name]: e.target.files[0] }));
};

export const RegisterForm = () => {
  const { register } = useContext(UserContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    legalName: '',
    birthday: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted with data:', formData);
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    await handleFormSubmit(formData, register, 'Registration successful', 'Registration failed');
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input type="text" name="username" placeholder="Username" value={formData.username} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => handleChange(e, setFormData)} required />
      {passwordError && <p className="error">{passwordError}</p>}
      <input type="text" name="legalName" placeholder="Legal Name" value={formData.legalName} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="date" name="birthday" placeholder="Birthday" value={formData.birthday} onChange={(e) => handleChange(e, setFormData)} required />
      <button type="submit">Register</button>
    </form>
  );
};

export const LoginForm = () => {
  const { login } = useContext(UserContext);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted with data:', formData);
    await handleFormSubmit(formData, login, 'Login successful', 'Login failed');
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input type="text" name="username" placeholder="Username" value={formData.username} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={(e) => handleChange(e, setFormData)} required />
      <button type="submit">Login</button>
    </form>
  );
};

export const ProfileForm = () => {
  const { user, updateProfile } = useContext(UserContext);
  const [formData, setFormData] = useState({
    ...user,
    profilePicture: null,
    coverPhoto: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Profile form submitted with data:', formData);
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    await handleFormSubmit(form, updateProfile, 'Profile updated successfully', 'Profile update failed');
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>Update Profile</h2>
      <input type="text" name="username" placeholder="Username" value={formData.username} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="text" name="legalName" placeholder="Legal Name" value={formData.legalName} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="date" name="birthday" placeholder="Birthday" value={formData.birthday} onChange={(e) => handleChange(e, setFormData)} required />
      <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={(e) => handleChange(e, setFormData)} required></textarea>
      <textarea name="intro" placeholder="Intro" value={formData.intro} onChange={(e) => handleChange(e, setFormData)} required></textarea>
      <textarea name="about" placeholder="About" value={formData.about} onChange={(e) => handleChange(e, setFormData)} required></textarea>
      <input type="file" name="profilePicture" onChange={(e) => handleFileChange(e, setFormData)} />
      <input type="file" name="coverPhoto" onChange={(e) => handleFileChange(e, setFormData)} />
      <button type="submit">Update Profile</button>
    </form>
  );
};

export const ResetPasswordForm = () => {
  const { resetPassword } = useContext(UserContext);
  const [formData, setFormData] = useState({
    userId: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Reset password form submitted with data:', formData);
    if (formData.newPassword !== formData.confirmNewPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    await handleFormSubmit(formData, resetPassword, 'Password reset successful', 'Password reset failed');
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input type="text" name="userId" placeholder="User ID" value={formData.userId} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="password" name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={(e) => handleChange(e, setFormData)} required />
      <input type="password" name="confirmNewPassword" placeholder="Confirm New Password" value={formData.confirmNewPassword} onChange={(e) => handleChange(e, setFormData)} required />
      {passwordError && <p className="error">{passwordError}</p>}
      <button type="submit">Reset Password</button>
    </form>
  );
};