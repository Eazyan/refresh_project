import React from 'react';
import './TaskItem.css';

type TaskItemProps = {
    task: {
        id: string;
        text: string;
      };
    handleDelete: (id: string) => void;
};

const TaskItem: React.FC<TaskItemProps> = ({ task, handleDelete }) => {
    return (
      <li className='task-item' onClick={() => handleDelete(task.id)}>
        {task.text}
      </li>
    );
  };

export default TaskItem;