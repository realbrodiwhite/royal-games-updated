import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
// import { Register } from '../../lobbySlice';

const validationSchema = yup.object({
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .min(8, 'Password should be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string('Enter your password again')
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  username: yup
    .string('Enter your username')
    .min(3, 'Username should be at least 3 characters')
    .required('Username is required'),
  firstName: yup
    .string('Enter your first name')
    .required('First Name is required'),
  lastName: yup
    .string('Enter your last name')
    .required('Last Name is required'),
  phoneNumber: yup
    .string('Enter your phone number')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Phone Number is required'),
  address: yup.string('Enter your address').required('Address is required'),
  city: yup.string('Enter your city').required('City is required'),
  state: yup.string('Enter your state').required('State is required'),
  zipCode: yup
    .string('Enter your zip code')
    .matches(/^\d{5}$/, 'Zip code must be 5 digits')
    .required('Zip Code is required'),
  country: yup.string('Enter your country').required('Country is required'),
  referrerEmail: yup
    .string('Enter your referrer email')
    .email('Enter a valid email'),
  couponCode: yup.string('Enter your coupon code'),
});

const Register = ({ toggleForm }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      referrerEmail: '',
      couponCode: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      dispatch(Register(values));
    },
  });

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="auth-form">
      <h2>Register</h2>
      {step === 1 && (
        <>
          <div key="step1">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="error">{formik.errors.email}</div>
            )}
            <label>Password</label>
            <input
              type="password"
              placeholder="Choose a password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="error">{formik.errors.password}</div>
            )}
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="error">{formik.errors.confirmPassword}</div>
            )}
            <button type="button" onClick={handleNext}>Next</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div key="step2">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.username && formik.errors.username && (
              <div className="error">{formik.errors.username}</div>
            )}
            <label>First Name</label>
            <input
              type="text"
              placeholder="Enter your first name"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <div className="error">{formik.errors.firstName}</div>
            )}
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Enter your last name"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <div className="error">{formik.errors.lastName}</div>
            )}
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="error">{formik.errors.phoneNumber}</div>
            )}
            <label>Address</label>
            <input
              type="text"
              placeholder="Enter your address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="error">{formik.errors.address}</div>
            )}
            <label>City</label>
            <input
              type="text"
              placeholder="Enter your city"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.city && formik.errors.city && (
              <div className="error">{formik.errors.city}</div>
            )}
            <label>State</label>
            <input
              type="text"
              placeholder="Enter your state"
              name="state"
              value={formik.values.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.state && formik.errors.state && (
              <div className="error">{formik.errors.state}</div>
            )}
            <label>Zip Code</label>
            <input
              type="text"
              placeholder="Enter your zip code"
              name="zipCode"
              value={formik.values.zipCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.zipCode && formik.errors.zipCode && (
              <div className="error">{formik.errors.zipCode}</div>
            )}
            <label>Country</label>
            <input
              type="text"
              placeholder="Enter your country"
              name="country"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.country && formik.errors.country && (
              <div className="error">{formik.errors.country}</div>
            )}
            <label>Referrer Email</label>
            <input
              type="email"
              placeholder="Enter your referrer email"
              name="referrerEmail"
              value={formik.values.referrerEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.referrerEmail && formik.errors.referrerEmail && (
              <div className="error">{formik.errors.referrerEmail}</div>
            )}
            <label>Coupon Code</label>
            <input
              type="text"
              placeholder="Enter your coupon code"
              name="couponCode"
              value={formik.values.couponCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.couponCode && formik.errors.couponCode && (
              <div className="error">{formik.errors.couponCode}</div>
            )}
            <button type="button" onClick={handleBack}>Back</button>
            <button type="submit">Register</button>
            <p>
              Already have an account? Log in now.{' '}
              <span onClick={toggleForm}>Save & Finish</span>
            </p>
          </div>
        </>
      )}
    </form>
  );
};

export default Register;
