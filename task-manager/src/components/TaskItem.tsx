import React, { useContext } from 'react';
import './TaskItem.css';
import { TasksContext } from '../state/TasksContext';
import apiClient from '../api/axios';


type TaskItemProps = {
  task: {
    id: string;
    text: string;
  };
  className?: string;
  style?: React.CSSProperties;
};

const TaskItem = React.forwardRef<HTMLLIElement, TaskItemProps>(
  ({ task, className, style }, ref) => {

    const context = useContext(TasksContext);
    if (!context) {
      throw new Error('TaskItem must be used within a TasksProvider');
    }
    const { dispatch } = context;

    const handleDelete = async () => {
      try {
        await apiClient.delete(`/tasks/${task.id}`);
        dispatch({ type: 'DELETE_TASK', payload: task.id });
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    };

    return (
      <li
        className={`task-item ${className || ''}`}
        style={style}
        onClick={handleDelete}
        ref={ref}
      >
        {task.text}
      </li>
    );
  }
);

export default TaskItem;