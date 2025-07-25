import React, { useContext, useRef, useEffect } from 'react';
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
  
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { dispatch } = context;
  
  useEffect(() => {

    if (isVisible && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  
  }, [isVisible]);
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isVisible) {

      if (inputValue.trim() === '') return;
      
      dispatch({ type: 'ADD_TASK', payload: inputValue });
      onInputChange('');
      onFormSubmit();
    
    }
    
    else {
      onFormSubmit();
    }

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
        ref={inputRef}
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