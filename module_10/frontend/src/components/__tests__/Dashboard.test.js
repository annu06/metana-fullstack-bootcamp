import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock BlogCard component
jest.mock('../BlogCard', () => {
  return function MockBlogCard({ blog, showActions, onEdit, onDelete }) {
    return (
      <div data-testid={`blog-card-${blog._id}`}>
        <h3>{blog.title}</h3>
        <p>{blog.status}</p>
        {showActions && (
          <div>
            <button onClick={() => onEdit(blog)}>Edit</button>
            <button onClick={() => onDelete(blog._id)}>Delete</button>
          </div>
        )}
      </div>
    );
  };
});

// Mock AuthContext
const mockUser = {
  _id: 'user1',
  username: 'testuser',
  email: 'test@example.com'
};

const mockBlogs = [
  {
    _id: '1',
    title: 'Published Blog 1',
    content: 'Content 1',
    status: 'published',
    author: mockUser,
    category: 'Technology',
    tags: ['react'],
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  {
    _id: '2',
    title: 'Draft Blog 1',
    content: 'Content 2',
    status: 'draft',
    author: mockUser,
    category: 'Programming',
    tags: ['javascript'],
    createdAt: '2024-01-14T10:00:00.000Z'
  },
  {
    _id: '3',
    title: 'Published Blog 2',
    content: 'Content 3',
    status: 'published',
    author: mockUser,
    category: 'Web Development',
    tags: ['css'],
    createdAt: '2024-01-13T10:00:00.000Z'
  }
];

const mockAuthContext = {
  user: mockUser,
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

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { blogs: mockBlogs } });
    mockedAxios.delete.mockResolvedValue({ data: { message: 'Blog deleted successfully' } });
  });

  describe('Initial Rendering', () => {
    it('should render dashboard with user blogs', async () => {
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
        expect(screen.getByText('Draft Blog 1')).toBeInTheDocument();
        expect(screen.getByText('Published Blog 2')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(`/api/blogs/user/${mockUser._id}`);
    });

    it('should show loading state initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<Dashboard />);

      expect(screen.getByText('Loading your blogs...')).toBeInTheDocument();
    });

    it('should display blog statistics', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total blogs
        expect(screen.getByText('2')).toBeInTheDocument(); // Published blogs
        expect(screen.getByText('1')).toBeInTheDocument(); // Draft blogs
      });
    });

    it('should show create new blog button', () => {
      renderWithProviders(<Dashboard />);

      const createButton = screen.getByText('Create New Blog');
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('Blog Filtering', () => {
    beforeEach(async () => {
      renderWithProviders(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      });
    });

    it('should filter blogs by status - All', async () => {
      const allFilter = screen.getByText('All');
      fireEvent.click(allFilter);

      expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      expect(screen.getByText('Draft Blog 1')).toBeInTheDocument();
      expect(screen.getByText('Published Blog 2')).toBeInTheDocument();
    });

    it('should filter blogs by status - Published', async () => {
      const publishedFilter = screen.getByText('Published');
      fireEvent.click(publishedFilter);

      expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      expect(screen.getByText('Published Blog 2')).toBeInTheDocument();
      expect(screen.queryByText('Draft Blog 1')).not.toBeInTheDocument();
    });

    it('should filter blogs by status - Drafts', async () => {
      const draftsFilter = screen.getByText('Drafts');
      fireEvent.click(draftsFilter);

      expect(screen.getByText('Draft Blog 1')).toBeInTheDocument();
      expect(screen.queryByText('Published Blog 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Published Blog 2')).not.toBeInTheDocument();
    });

    it('should update active filter styling', async () => {
      const publishedFilter = screen.getByText('Published');
      fireEvent.click(publishedFilter);

      expect(publishedFilter).toHaveClass('active');
    });
  });

  describe('Blog Search', () => {
    beforeEach(async () => {
      renderWithProviders(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      });
    });

    it('should search blogs by title', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search your blogs...');

      await user.type(searchInput, 'Published Blog 1');

      expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      expect(screen.queryByText('Draft Blog 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Published Blog 2')).not.toBeInTheDocument();
    });

    it('should search blogs by content', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search your blogs...');

      await user.type(searchInput, 'Content 2');

      expect(screen.getByText('Draft Blog 1')).toBeInTheDocument();
      expect(screen.queryByText('Published Blog 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Published Blog 2')).not.toBeInTheDocument();
    });

    it('should show no results message when search yields no results', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search your blogs...');

      await user.type(searchInput, 'nonexistent blog');

      expect(screen.getByText('No blogs found matching your criteria.')).toBeInTheDocument();
    });

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search your blogs...');

      await user.type(searchInput, 'Published Blog 1');
      expect(screen.queryByText('Draft Blog 1')).not.toBeInTheDocument();

      await user.clear(searchInput);
      expect(screen.getByText('Draft Blog 1')).toBeInTheDocument();
    });
  });

  describe('Blog Actions', () => {
    beforeEach(async () => {
      renderWithProviders(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      });
    });

    it('should navigate to create blog page when create button is clicked', () => {
      const createButton = screen.getByText('Create New Blog');
      fireEvent.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith('/create-blog');
    });

    it('should navigate to edit blog page when edit is clicked', () => {
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith('/create-blog', {
        state: { blog: mockBlogs[0] }
      });
    });

    it('should show confirmation dialog when delete is clicked', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this blog? This action cannot be undone.'
      );

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith('/api/blogs/1');
      });

      window.confirm = originalConfirm;
    });

    it('should not delete blog when confirmation is cancelled', () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      expect(mockedAxios.delete).not.toHaveBeenCalled();

      window.confirm = originalConfirm;
    });

    it('should remove blog from list after successful deletion', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText('Published Blog 1')).not.toBeInTheDocument();
      });

      window.confirm = originalConfirm;
    });

    it('should handle delete error gracefully', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);
      mockedAxios.delete.mockRejectedValueOnce(new Error('Delete failed'));

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete blog. Please try again.')).toBeInTheDocument();
      });

      // Blog should still be in the list
      expect(screen.getByText('Published Blog 1')).toBeInTheDocument();

      window.confirm = originalConfirm;
    });
  });

  describe('Error Handling', () => {
    it('should show error message when fetching blogs fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load blogs. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry fetching blogs when retry button is clicked', async () => {
      mockedAxios.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockBlogs });
      
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty States', () => {
    it('should show empty state when user has no blogs', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('No blogs yet')).toBeInTheDocument();
        expect(screen.getByText('Start writing your first blog post!')).toBeInTheDocument();
      });
    });

    it('should show create blog button in empty state', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText('Create New Blog')).toHaveLength(2); // One in header, one in empty state
      });
    });
  });

  describe('Statistics Updates', () => {
    it('should update statistics after blog deletion', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Total blogs
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Updated total
      });

      window.confirm = originalConfirm;
    });

    it('should show correct statistics for filtered blogs', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      });

      const draftsFilter = screen.getByText('Drafts');
      fireEvent.click(draftsFilter);

      // Statistics should still show total counts, not filtered counts
      expect(screen.getByText('3')).toBeInTheDocument(); // Total blogs
      expect(screen.getByText('2')).toBeInTheDocument(); // Published blogs
      expect(screen.getByText('1')).toBeInTheDocument(); // Draft blogs
    });
  });

  describe('Responsive Behavior', () => {
    it('should render properly on different screen sizes', async () => {
      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Published Blog 1')).toBeInTheDocument();
      });

      // Check that the dashboard layout is responsive
      const dashboard = screen.getByText('My Dashboard').closest('.dashboard');
      expect(dashboard).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      renderWithProviders(<Dashboard />);

      const searchInput = screen.getByPlaceholderText('Search your blogs...');
      expect(searchInput).toHaveAttribute('aria-label');

      const createButton = screen.getByText('Create New Blog');
      expect(createButton).toHaveAttribute('role', 'button');
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<Dashboard />);

      const searchInput = screen.getByPlaceholderText('Search your blogs...');
      const createButton = screen.getByText('Create New Blog');

      expect(searchInput).not.toHaveAttribute('disabled');
      expect(createButton).not.toHaveAttribute('disabled');
    });
  });
});