import './App.css'
import { useState, useReducer } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { tasksReducer } from './state/tasksReducer';

function App() {

  const [tasks, dispatch] = useReducer(tasksReducer, []);

  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleDeleteTask = (idToDelete: string) => {

    dispatch({ type: 'DELETE_TASK', payload: idToDelete });

  };

  const handleAddTask = (event: React.FormEvent) => {

    event.preventDefault();
    
    if (inputValue.trim() === '') return;

    dispatch({ type: 'ADD_TASK', payload: inputValue });
    
    setInputValue('');
    setShowInput(false);

  }

  return (

      <div className='app-container'>

        <h1>Мои задачи</h1>

        {showInput ? (
          <TaskForm
          inputValue={inputValue}
          onInputChange={setInputValue}
          onFormSubmit={handleAddTask}
          />
        ) : (
          <button 
            className='add-task-button add-task-button--standalone'
            onClick={() => setShowInput(true)}
          >
            Новая задача
          </button>
        )}

        <TaskList
          tasks={tasks}
          handleDelete={handleDeleteTask}
        />

      </div>
  )
}

export default App
