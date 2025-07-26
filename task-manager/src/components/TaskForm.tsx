import React, { useContext, useRef } from 'react';
import './TaskForm.css';
import { TasksContext } from '../state/TasksContext'; 

type TaskFormProps = {
  isVisible: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onFormSubmit: () => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ isVisible, inputValue, onInputChange, onFormSubmit }) => {

  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('TaskForm must be used within a TasksProvider');
  }
  
  const formRef = useRef<HTMLFormElement>(null);
  const { dispatch } = context;
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isVisible) {
        onFormSubmit();
        return;
    }

    const text = inputValue.trim();
    if (text === '') {
        onFormSubmit();
        return;
    }

    fetch('http://localhost:8000/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(newTask => {
        dispatch({ type: 'ADD_TASK', payload: newTask });
        onInputChange('');
        onFormSubmit();
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
  };

  const handleClick = (event: React.MouseEvent) => {

    if (!isVisible) {
      event.preventDefault();
      onFormSubmit();
    }

  };

  return (

    <form
      ref={formRef}
      onSubmit={handleSubmit} 
      className={`add-task-form ${isVisible ? 'visible' : ''}`}
      onClick={handleClick}
    >

      <div className="add-task-button__icon"></div>
      <input
        autoFocus={isVisible}
        type="text"
        placeholder="Что нужно сделать?"
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        className="add-task-input"
      />
      <button 
        type="submit" 
        className="add-task-submit"
        aria-label="Добавить задачу"
      >
        <span className="add-task-submit__icon">➤</span>
      </button>

    </form>

  );
};

export default TaskForm;