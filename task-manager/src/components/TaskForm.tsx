import React, { useContext } from 'react';
import './TaskForm.css';
import { TasksContext } from '../state/TasksContext'; 


type TaskFormProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  onFormSubmit: () => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ inputValue, onInputChange, onFormSubmit }) => {

  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('TaskForm must be used within a TasksProvider');
  }

  const { dispatch } = context;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() === '') return;

    dispatch({ type: 'ADD_TASK', payload: inputValue });

    onInputChange('');
    onFormSubmit();
  };

  return (

      <form onSubmit={handleSubmit} className='add-task-form'>
      <input
        type="text"
        placeholder="Что нужно сделать?"
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        className='add-task-input'
        autoFocus
      />
      <button type="submit" className='add-task-button add-task-button--in-form'>Добавить</button>
    </form>
  );
};

export default TaskForm;