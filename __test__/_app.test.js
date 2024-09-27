// src/App.test.js

/**
 * Importing render and screen functions from @testing-library/react
 */
import { render, screen } from '@testing-library/react';

/**
 * Importing the App component from App.js file
 */
import App from './App';

/**
 * Test suite for the App component
 */
test('renders learn react link', () => {
  /**
   * Rendering the App component using the render function
   */
  render(<App />);
  
  /**
   * Retrieving the link element with the text "learn react" (case-insensitive) using the getByText function
   */
  const linkElement = screen.getByText(/learn react/i);
  
  /**
   * Asserting that the link element is present in the document using the toBeInTheDocument matcher
   */
  expect(linkElement).toBeInTheDocument();
});