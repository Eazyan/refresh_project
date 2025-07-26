import React, { createContext, useReducer, useEffect } from 'react';
import { tasksReducer } from './tasksReducer';
import type { Task, Action } from './types';
import apiClient from '../api/axios';


type TasksContextType = {
  tasks: Task[];
  dispatch: React.Dispatch<Action>;
};


export const TasksContext = createContext<TasksContextType | undefined>(undefined);
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    
    const [tasks, dispatch] = useReducer(tasksReducer, []);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await apiClient.get('/tasks');
                dispatch({ type: 'SET_TASKS', payload: response.data });
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            }
        };
    
        fetchTasks();
    }, []);

    return (
        <TasksContext.Provider value={{ tasks, dispatch }}>
            {children}
        </TasksContext.Provider>
    );
};