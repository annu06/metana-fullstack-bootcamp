import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from '../pages/Home';

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  test('renders home page with hero section', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByTestId('hero-title')).toHaveTextContent('Welcome to TaskManager');
    expect(screen.getByTestId('hero-description')).toBeInTheDocument();
  });

  test('displays call-to-action buttons', () => {
    renderWithRouter(<Home />);
    
    const getStartedButton = screen.getByTestId('get-started-button');
    const loginButton = screen.getByTestId('login-button');
    
    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton).toHaveTextContent('Get Started');
    expect(getStartedButton).toHaveAttribute('href', '/register');
    
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Login');
    expect(loginButton).toHaveAttribute('href', '/login');
  });

  test('renders features section with all feature cards', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByTestId('features-title')).toHaveTextContent('Features');
    expect(screen.getByTestId('feature-organize')).toBeInTheDocument();
    expect(screen.getByTestId('feature-track')).toBeInTheDocument();
    expect(screen.getByTestId('feature-collaborate')).toBeInTheDocument();
  });

  test('feature cards contain correct content', () => {
    renderWithRouter(<Home />);
    
    const organizeFeature = screen.getByTestId('feature-organize');
    expect(organizeFeature).toHaveTextContent('Organize Tasks');
    expect(organizeFeature).toHaveTextContent('Create, edit, and organize your tasks with ease');
    
    const trackFeature = screen.getByTestId('feature-track');
    expect(trackFeature).toHaveTextContent('Track Progress');
    expect(trackFeature).toHaveTextContent('Monitor your productivity with visual progress indicators');
    
    const collaborateFeature = screen.getByTestId('feature-collaborate');
    expect(collaborateFeature).toHaveTextContent('Stay Focused');
    expect(collaborateFeature).toHaveTextContent('Filter and search through your tasks');
  });

  test('has proper semantic structure', () => {
    renderWithRouter(<Home />);
    
    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Welcome to TaskManager');
    
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Features');
    
    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s).toHaveLength(3);
  });

  test('buttons have correct CSS classes', () => {
    renderWithRouter(<Home />);
    
    const getStartedButton = screen.getByTestId('get-started-button');
    const loginButton = screen.getByTestId('login-button');
    
    expect(getStartedButton).toHaveClass('btn', 'btn-primary', 'btn-large');
    expect(loginButton).toHaveClass('btn', 'btn-secondary', 'btn-large');
  });
});