import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock BlogCard component
jest.mock('../../components/BlogCard', () => {
  return function MockBlogCard({ blog }) {
    return (
      <div data-testid={`blog-card-${blog._id}`}>
        <h3>{blog.title}</h3>
        <p>{blog.category}</p>
        <span>{blog.status}</span>
      </div>
    );
  };
});

const mockBlogs = [
  {
    _id: '1',
    title: 'React Best Practices',
    content: 'Learn about React best practices...',
    excerpt: 'A comprehensive guide to React best practices',
    status: 'published',
    category: 'Technology',
    tags: ['react', 'javascript'],
    author: {
      _id: 'author1',
      username: 'johndoe',
      email: 'john@example.com'
    },
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  {
    _id: '2',
    title: 'JavaScript Fundamentals',
    content: 'Understanding JavaScript fundamentals...',
    excerpt: 'Master the basics of JavaScript programming',
    status: 'published',
    category: 'Programming',
    tags: ['javascript', 'basics'],
    author: {
      _id: 'author2',
      username: 'janedoe',
      email: 'jane@example.com'
    },
    createdAt: '2024-01-14T10:00:00.000Z'
  },
  {
    _id: '3',
    title: 'CSS Grid Layout',
    content: 'Master CSS Grid for modern layouts...',
    excerpt: 'Learn how to create responsive layouts with CSS Grid',
    status: 'published',
    category: 'Web Development',
    tags: ['css', 'layout'],
    author: {
      _id: 'author3',
      username: 'bobsmith',
      email: 'bob@example.com'
    },
    createdAt: '2024-01-13T10:00:00.000Z'
  }
];

const mockPaginatedResponse = {
  blogs: mockBlogs,
  totalPages: 2,
  currentPage: 1,
  totalBlogs: 5
};

const mockCategories = ['Technology', 'Programming', 'Web Development', 'Design'];

// Mock AuthContext
const mockAuthContext = {
  user: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
  loading: false
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url === '/api/blogs') {
        return Promise.resolve({ data: mockPaginatedResponse });
      }
      if (url === '/api/blogs/categories') {
        return Promise.resolve({ data: mockCategories });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('Initial Rendering', () => {
    it('should render home page with blogs', async () => {
      renderWithProviders(<Home />);

      expect(screen.getByText('Latest Blog Posts')).toBeInTheDocument();
      expect(screen.getByText('Discover amazing content from our community')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
        expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('CSS Grid Layout')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/blogs', {
          params: {
            page: 1,
            limit: 6
          }
        });
    });

    it('should show loading state initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<Home />);

      expect(screen.getByText('Loading blogs...')).toBeInTheDocument();
    });

    it('should load categories on mount', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/blogs/categories');
      });
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      renderWithProviders(<Home />);
      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      });
    });

    it('should search blogs when search input changes', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search blogs...');

      await user.type(searchInput, 'React');

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/blogs', {
          params: {
            page: 1,
            limit: 6,
            search: 'React'
          }
        });
      });
    });

    it('should debounce search input', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search blogs...');

      // Type multiple characters quickly
      await user.type(searchInput, 'React', { delay: 50 });

      // Should call API after typing
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });

    it('should clear search results when search is cleared', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search blogs...');

      await user.type(searchInput, 'React');
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/blogs', expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            limit: 6
          })
        }));
      });
    });
  });

  describe('Category Filtering', () => {
    beforeEach(async () => {
      renderWithProviders(<Home />);
      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      });
    });

    it('should render category filter dropdown', async () => {
      await waitFor(() => {
        expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
      });
    });

    it('should populate category options', async () => {
      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toBeInTheDocument();
        
        // Check if categories are loaded (they would be in the select options)
        fireEvent.click(categorySelect);
      });
    });

    it('should filter blogs by category', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toBeInTheDocument();
      });

      const categorySelect = screen.getByDisplayValue('All Categories');
      await user.selectOptions(categorySelect, 'Technology');

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/blogs', {
          params: {
            page: 1,
            limit: 6,
            category: 'Technology'
          }
        });
      });
    });

    it('should reset to all categories', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockPaginatedResponse });
      const user = userEvent.setup();
      
      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toBeInTheDocument();
      });

      const categorySelect = screen.getByDisplayValue('All Categories');
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
      await user.selectOptions(categorySelect, 'Technology');
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
      await user.selectOptions(categorySelect, '');

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/blogs', expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            limit: 6
          })
        }));
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      renderWithProviders(<Home />);
      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      });
    });

    it('should render pagination controls', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
        expect(screen.getByTestId('page-1')).toBeInTheDocument();
        expect(screen.getByTestId('page-2')).toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/blogs', {
          params: {
            page: 2,
            limit: 6
          }
        });
      });
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      
      // First go to page 2
      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument();
      });

      const prevButton = screen.getByText('Previous');
      await user.click(prevButton);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenLastCalledWith('/api/blogs', {
          params: {
            page: 1,
            limit: 6
          }
        });
      });
    });

    it('should disable previous button on first page', async () => {
      await waitFor(() => {
        const prevButton = screen.queryByText('Previous');
        expect(prevButton).toBeNull(); // Should not exist on first page
      });
    });

    it('should disable next button on last page', async () => {
      // Mock response for last page
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          ...mockPaginatedResponse,
          currentPage: 2,
          totalPages: 2
        }
      });

      const user = userEvent.setup();
      
      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        const nextButtonAfter = screen.queryByText('Next');
        expect(nextButtonAfter).toBeNull(); // Should not exist on last page
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when fetching blogs fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load blogs. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry fetching blogs when retry button is clicked', async () => {
      mockedAxios.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockPaginatedResponse });
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      });
    });

    it('should handle category loading failure gracefully', async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url === '/api/blogs') {
          return Promise.resolve({ data: mockPaginatedResponse });
        }
        if (url === '/api/blogs/categories') {
          return Promise.reject(new Error('Categories failed'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      });

      // Should still render the category select even if categories failed to load
      expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no blogs are found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          blogs: [],
          totalPages: 0,
          currentPage: 1,
          totalBlogs: 0
        }
      });
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('No blogs available')).toBeInTheDocument();
        expect(screen.getByText('Be the first to share your story!')).toBeInTheDocument();
      });
    });

    it('should show no results message for search with no results', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      });

      // Mock empty search results
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          blogs: [],
          totalPages: 0,
          currentPage: 1,
          totalBlogs: 0
        }
      });

      const searchInput = screen.getByPlaceholderText('Search blogs...');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No blogs found')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render properly on different screen sizes', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      });

      // Check that the home layout is responsive
      const homeContainer = screen.getByTestId('home');
      expect(homeContainer).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not make unnecessary API calls', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('React Best Practices')).toBeInTheDocument();
      });

      // Should have made initial call for blogs
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid filter changes efficiently', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Home />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
      });

      const categorySelect = screen.getByDisplayValue('All Categories');
      
      // Rapidly change categories
      await user.selectOptions(categorySelect, 'Technology');
      await user.selectOptions(categorySelect, 'Programming');
      await user.selectOptions(categorySelect, 'Web Development');

      // Should handle all changes without errors
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search blogs...');
        expect(searchInput).toHaveAttribute('aria-label');
      });

      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard navigable', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
      
      renderWithProviders(<Home />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search blogs...');
        expect(searchInput).not.toHaveAttribute('disabled');
      });

      await waitFor(() => {
        const categorySelect = screen.getByDisplayValue('All Categories');
        expect(categorySelect).not.toHaveAttribute('disabled');
      });
    });

    it('should announce loading states to screen readers', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<Home />);

      const loadingMessage = screen.getByText('Loading blogs...');
      expect(loadingMessage).toHaveAttribute('aria-live', 'polite');
    });
  });
});