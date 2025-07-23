import './App.css'
import { useState } from 'react';
import { v4 as uuid } from 'uuid'; // <-- ДОБАВЬТЕ ЭТУ СТРОКУ

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
          <form onSubmit={handleAddTask} className='add-task-form'>
            <input 
              type="text"
              placeholder="Что нужно сделать?"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className='add-task-input'
              autoFocus
            />
            <button type="submit" className='add-task-button add-task-button--in-form'>Добавить</button>
          </form>
        ) : (
          <button 
            className='add-task-button add-task-button--standalone'
            onClick={() => setShowInput(true)}
          >
            Новая задача
          </button>
        )}

        <ul className='task-list'>
          {
            tasks.map(task => (
              <li key={task.id} className='task-item' onClick={() => handleDeleteTask(task.id)}>
                {task.text}
              </li>
            ))
          }
        </ul>

      </div>
  )
}

export default App
