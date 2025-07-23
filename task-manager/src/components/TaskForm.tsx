import React from 'react';
import './TaskForm.css'

type TaskFormProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  onFormSubmit: (event: React.FormEvent) => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ inputValue, onInputChange, onFormSubmit }) => {
  return (
    <form onSubmit={onFormSubmit} className='add-task-form'>
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