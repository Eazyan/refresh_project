import './App.css';
import { useState } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { TasksProvider } from './state/TasksContext';

function App() {

  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (

    <TasksProvider>

      <div className='app-container'>
        
        <h1>Мои задачи</h1>

        {showInput ? (
          <TaskForm
            inputValue={inputValue}
            onInputChange={setInputValue}
            onFormSubmit={() => setShowInput(false)}
          />
        ) : (
          <button
            className='add-task-button add-task-button--standalone'
            onClick={() => setShowInput(true)}
          >
            Новая задача
          </button>
        )}

        <TaskList />
        
      </div>

    </TasksProvider>
  );
}

export default App;