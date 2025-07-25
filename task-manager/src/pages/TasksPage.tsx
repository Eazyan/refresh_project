import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const TasksPage: React.FC = () => {

    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);

    return (
    <>
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
    </>
    );
};

export default TasksPage;