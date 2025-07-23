import './App.css'
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

function App() {

  const [tasks, setTasks] = useState([
    {
      id: '1',
      text: 'Моя первая задача из примера'
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleDeleteTask = (idToDelete: string) => {
    
    const newTasks = tasks.filter(task => task.id !== idToDelete);
    setTasks(newTasks);
  
  };

  const handleAddTask = (event: React.FormEvent) => {

    event.preventDefault();
    
    if (inputValue.trim() === '') {
      return;
    };

    const newTask = {
      id: uuid(),
      text: inputValue,
    };

    const newTasks = [...tasks, newTask];
    
    setTasks(newTasks);

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
