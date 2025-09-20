import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from '../components/TaskCard';

describe('TaskCard Component', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    description: 'Test task description',
    priority: 'medium',
    completed: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    dueDate: '2024-12-31T00:00:00.000Z'
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders task card with all task information', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.getByTestId('task-card')).toBeInTheDocument();
    expect(screen.getByTestId('task-title')).toHaveTextContent('Test Task');
    expect(screen.getByTestId('task-description')).toHaveTextContent('Test task description');
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('Medium Priority');
    expect(screen.getByTestId('task-date')).toBeInTheDocument();
    expect(screen.getByTestId('task-due-date')).toBeInTheDocument();
  });

  test('applies correct CSS classes based on task properties', () => {
    const completedTask = { ...mockTask, completed: true };
    render(
      <TaskCard
        task={completedTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveClass('completed');
    expect(taskCard).toHaveClass('priority-medium');
  });

  test('applies high priority class correctly', () => {
    const highPriorityTask = { ...mockTask, priority: 'high' };
    render(
      <TaskCard
        task={highPriorityTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveClass('priority-high');
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('High Priority');
  });

  test('shows Mark Complete button for incomplete tasks', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const completeButton = screen.getByTestId('complete-button');
    expect(completeButton).toHaveTextContent('Mark Complete');
    expect(completeButton).toHaveClass('btn-success');
  });

  test('shows Mark Incomplete button for completed tasks', () => {
    const completedTask = { ...mockTask, completed: true };
    render(
      <TaskCard
        task={completedTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const completeButton = screen.getByTestId('complete-button');
    expect(completeButton).toHaveTextContent('Mark Incomplete');
    expect(completeButton).toHaveClass('btn-secondary');
  });

  test('calls onComplete when complete button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const completeButton = screen.getByTestId('complete-button');
    fireEvent.click(completeButton);
    
    expect(mockOnComplete).toHaveBeenCalledWith('1', true);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  test('enters edit mode when edit button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('task-edit-form')).toBeInTheDocument();
    expect(screen.getByTestId('edit-title-input')).toHaveValue('Test Task');
    expect(screen.getByTestId('edit-description-input')).toHaveValue('Test task description');
    expect(screen.getByTestId('edit-priority-select')).toHaveValue('medium');
  });

  test('saves changes when save button is clicked in edit mode', async () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    // Enter edit mode
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Make changes
    const titleInput = screen.getByTestId('edit-title-input');
    const descriptionInput = screen.getByTestId('edit-description-input');
    const prioritySelect = screen.getByTestId('edit-priority-select');
    
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    
    // Save changes
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith('1', {
      title: 'Updated Task',
      description: 'Updated description',
      priority: 'high'
    });
  });

  test('cancels edit mode when cancel button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    // Enter edit mode
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    // Make changes
    const titleInput = screen.getByTestId('edit-title-input');
    fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
    
    // Cancel changes
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should exit edit mode and revert changes
    expect(screen.queryByTestId('task-edit-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-content')).toBeInTheDocument();
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  test('formats dates correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const taskDate = screen.getByTestId('task-date');
    const dueDate = screen.getByTestId('task-due-date');
    
    expect(taskDate).toHaveTextContent('Created: 1/1/2024');
    expect(dueDate).toHaveTextContent('Due: 12/31/2024');
  });

  test('does not render description if not provided', () => {
    const taskWithoutDescription = { ...mockTask, description: '' };
    render(
      <TaskCard
        task={taskWithoutDescription}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.queryByTestId('task-description')).not.toBeInTheDocument();
  });

  test('does not render due date if not provided', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: null };
    render(
      <TaskCard
        task={taskWithoutDueDate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    expect(screen.queryByTestId('task-due-date')).not.toBeInTheDocument();
  });

  test('handles low priority tasks correctly', () => {
    const lowPriorityTask = { ...mockTask, priority: 'low' };
    render(
      <TaskCard
        task={lowPriorityTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onComplete={mockOnComplete}
      />
    );
    
    const taskCard = screen.getByTestId('task-card');
    expect(taskCard).toHaveClass('priority-low');
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('Low Priority');
  });
});