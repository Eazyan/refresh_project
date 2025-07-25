import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const TasksPage: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);

    const handleFormSubmit = () => {
        setShowInput(false);
    };

    return (
    <>
        <div className="task-action-container">
            <button
                className={`add-task-button add-task-button--standalone ${showInput ? 'hidden' : ''}`}
                onClick={() => setShowInput(true)}
            >
                Новая задача
            </button>
            
            <TaskForm
                isVisible={showInput}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onFormSubmit={handleFormSubmit}
            />
        </div>

        <TaskList />
    </>
    );
};

export default TasksPage;