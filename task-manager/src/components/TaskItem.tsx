import React from 'react';
import './TaskItem.css';

type TaskItemProps = {
  task: {
    id: string;
    text: string;
  };

  handleDelete: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
};

const TaskItem = React.forwardRef<HTMLLIElement, TaskItemProps>(({ task, handleDelete, className, style }, ref) => {
  return (
    <li
      className={`task-item ${className || ''}`}
      style={style}
      onClick={() => handleDelete(task.id)}
      ref={ref}
    >
      {task.text}
    </li>
  );
});

export default TaskItem;