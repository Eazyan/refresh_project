import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const TasksPage: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);

    const toggleForm = () => {
        setShowInput(!showInput);
    };

    return (
    <>
        <div className="task-action-container">
            <TaskForm
                isVisible={showInput}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onFormSubmit={toggleForm} 
            />
        </div>

        <TaskList />
    </>
    );
};

export default TasksPage;