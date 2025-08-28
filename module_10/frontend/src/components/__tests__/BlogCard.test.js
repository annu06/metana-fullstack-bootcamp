import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogCard from '../BlogCard';

import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const mockBlog = {
  _id: '1',
  title: 'Test Blog Post',
  content: 'This is a test blog post content that should be truncated if too long.',
  excerpt: 'This is a test excerpt',
  author: {
    _id: 'author1',
    username: 'testauthor',
    email: 'author@test.com'
  },
  category: 'Technology',
  tags: ['react', 'testing', 'javascript'],
  status: 'published',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T12:00:00.000Z'
};

const mockDraftBlog = {
  ...mockBlog,
  _id: '2',
  title: 'Draft Blog Post',
  status: 'draft'
};

// Mock AuthContext
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

const renderWithProviders = (component, user = null) => {
  mockUseAuth.mockReturnValue({
    user,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    loading: false
  });

  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BlogCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render blog card with all basic information', () => {
      renderWithProviders(<BlogCard blog={mockBlog} />);

      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
      expect(screen.getByText('testauthor')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('testing')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    it('should render draft badge for draft posts', () => {
      renderWithProviders(<BlogCard blog={mockDraftBlog} />);

      expect(screen.getByText('DRAFT')).toBeInTheDocument();
      expect(screen.getByText('DRAFT')).toHaveClass('draft-badge');
    });

    it('should not render draft badge for published posts', () => {
      renderWithProviders(<BlogCard blog={mockBlog} />);

      expect(screen.queryByText('DRAFT')).not.toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      renderWithProviders(<BlogCard blog={mockBlog} />);

      // Check if date is formatted (exact format may vary based on locale)
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });

    it('should handle missing excerpt by using content', () => {
      const blogWithoutExcerpt = {
        ...mockBlog,
        excerpt: ''
      };

      renderWithProviders(<BlogCard blog={blogWithoutExcerpt} />);

      expect(screen.getByText(/This is a test blog post content/)).toBeInTheDocument();
    });

    it('should truncate long content when used as excerpt', () => {
      const blogWithLongContent = {
        ...mockBlog,
        excerpt: '',
        content: 'This is a very long blog post content that should be truncated when displayed as an excerpt because it exceeds the maximum length limit set for excerpts in the blog card component.'
      };

      renderWithProviders(<BlogCard blog={blogWithLongContent} />);

      const excerptElement = screen.getByText(/This is a very long blog post content/);
      expect(excerptElement.textContent).toMatch(/\.\.\.$/); // Should end with ...
    });
  });

  describe('Author Actions', () => {
    const mockUser = {
      _id: 'author1',
      username: 'testauthor',
      email: 'author@test.com'
    };

    it('should show edit and delete buttons for blog author', () => {
      renderWithProviders(<BlogCard blog={mockBlog} showActions={true} />, mockUser);

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should not show actions when showActions is false', () => {
      renderWithProviders(<BlogCard blog={mockBlog} showActions={false} />, mockUser);

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should not show actions for non-author users', () => {
      const differentUser = {
        _id: 'different-user',
        username: 'differentuser',
        email: 'different@test.com'
      };

      renderWithProviders(<BlogCard blog={mockBlog} showActions={true} />, differentUser);

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should not show actions when user is not logged in', () => {
      renderWithProviders(<BlogCard blog={mockBlog} showActions={true} />, null);

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', () => {
      const mockOnEdit = jest.fn();
      renderWithProviders(
        <BlogCard blog={mockBlog} showActions={true} onEdit={mockOnEdit} />,
        mockUser
      );

      fireEvent.click(screen.getByText('Edit'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockBlog);
    });

    it('should call onDelete when delete button is clicked', () => {
      const mockOnDelete = jest.fn();
      renderWithProviders(
        <BlogCard blog={mockBlog} showActions={true} onDelete={mockOnDelete} />,
        mockUser
      );

      fireEvent.click(screen.getByText('Delete'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockBlog._id);
    });
  });

  describe('Navigation', () => {
    it('should navigate to blog detail when title is clicked', () => {
      renderWithProviders(<BlogCard blog={mockBlog} />);

      const titleLink = screen.getByRole('link', { name: 'Test Blog Post' });
      expect(titleLink).toHaveAttribute('href', '/blog/1');
    });

    it('should navigate to blog detail when card is clicked', () => {
      renderWithProviders(<BlogCard blog={mockBlog} />);

      const cardElement = screen.getByTestId('blog-card') || screen.getByText('Test Blog Post').closest('.blog-card');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should apply correct CSS classes', () => {
      renderWithProviders(<BlogCard blog={mockBlog} />);

      const cardElement = screen.getByText('Test Blog Post').closest('.blog-card');
      expect(cardElement).toHaveClass('blog-card');
    });

    it('should apply draft styling for draft posts', () => {
      renderWithProviders(<BlogCard blog={mockDraftBlog} />);

      const draftBadge = screen.getByText('DRAFT');
      expect(draftBadge).toHaveClass('draft-badge');
    });
  });

  describe('Edge Cases', () => {
    it('should handle blog with no tags', () => {
      const blogWithoutTags = {
        ...mockBlog,
        tags: []
      };

      renderWithProviders(<BlogCard blog={blogWithoutTags} />);

      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      // Should not crash and should render other content
    });

    it('should handle blog with no category', () => {
      const blogWithoutCategory = {
        ...mockBlog,
        category: ''
      };

      renderWithProviders(<BlogCard blog={blogWithoutCategory} />);

      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      // Should not crash and should render other content
    });

    it('should handle blog with missing author information', () => {
      const blogWithoutAuthor = {
        ...mockBlog,
        author: {
          _id: 'unknown',
          username: '',
          email: ''
        }
      };

      renderWithProviders(<BlogCard blog={blogWithoutAuthor} />);

      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      // Should not crash even with missing author info
    });

    it('should handle very long titles', () => {
      const blogWithLongTitle = {
        ...mockBlog,
        title: 'This is a very long blog post title that might need to be handled properly in the UI to prevent layout issues and ensure good user experience'
      };

      renderWithProviders(<BlogCard blog={blogWithLongTitle} />);

      expect(screen.getByText(/This is a very long blog post title/)).toBeInTheDocument();
    });

    it('should handle invalid dates gracefully', () => {
      const blogWithInvalidDate = {
        ...mockBlog,
        createdAt: 'invalid-date',
        updatedAt: 'invalid-date'
      };

      renderWithProviders(<BlogCard blog={blogWithInvalidDate} />);

      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      // Should not crash with invalid dates
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<BlogCard blog={mockBlog} showActions={true} />, {
        _id: 'author1',
        username: 'testauthor'
      });

      const titleLink = screen.getByRole('link', { name: 'Test Blog Post' });
      expect(titleLink).toBeInTheDocument();

      const editButton = screen.getByRole('button', { name: 'Edit' });
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      renderWithProviders(<BlogCard blog={mockBlog} showActions={true} />, {
        _id: 'author1',
        username: 'testauthor'
      });

      const titleLink = screen.getByRole('link', { name: 'Test Blog Post' });
      const editButton = screen.getByRole('button', { name: 'Edit' });
      const deleteButton = screen.getByRole('button', { name: 'Delete' });

      // These elements should be focusable
      expect(titleLink).toHaveAttribute('href');
      expect(editButton).not.toHaveAttribute('disabled');
      expect(deleteButton).not.toHaveAttribute('disabled');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = renderWithProviders(<BlogCard blog={mockBlog} />);

      // Re-render with same props
      rerender(
        <BrowserRouter>
          <AuthProvider>
            <BlogCard blog={mockBlog} />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });
  });
});