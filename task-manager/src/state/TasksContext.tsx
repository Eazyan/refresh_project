import React, { createContext, useReducer, useEffect } from 'react';
import { tasksReducer } from './tasksReducer';
import type { Task, Action } from './types';


type TasksContextType = {
  tasks: Task[];
  dispatch: React.Dispatch<Action>;
};


export const TasksContext = createContext<TasksContextType | undefined>(undefined);
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    
    const [tasks, dispatch] = useReducer(tasksReducer, []);

    useEffect(() => {

        fetch('http://localhost:8000/api/tasks')
        .then(response => response.json())
        .then(data => {
            dispatch({ type: 'SET_TASKS', payload: data })
        });

    }, []);

    return (
        <TasksContext.Provider value={{ tasks, dispatch }}>
            {children}
        </TasksContext.Provider>
    );
};