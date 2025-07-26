import React, { useContext } from 'react';
import './TaskItem.css';
import { TasksContext } from '../state/TasksContext';


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

    const handleDelete = () => {
      fetch(`http://localhost:8000/api/tasks/${task.id}`, {
        method: 'DELETE',
      })
      .then(response => {
        // Для DELETE запросов успешным ответом может быть статус 204
        if (response.ok) {
          // Только теперь, когда сервер подтвердил удаление,
          // мы обновляем состояние нашего приложения
          dispatch({ type: 'DELETE_TASK', payload: task.id });
        } else {
          // Обработка возможных ошибок
          console.error('Failed to delete task');
        }
      })
      .catch(error => {
        console.error('Error sending delete request:', error);
      });
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