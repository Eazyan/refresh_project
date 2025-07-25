import React, { createContext, useReducer } from 'react';
import { tasksReducer } from './tasksReducer';
import type { Task, Action } from './types';


type TasksContextType = {
  tasks: Task[];
  dispatch: React.Dispatch<Action>;
};


export const TasksContext = createContext<TasksContextType | undefined>(undefined);
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
    const [tasks, dispatch] = useReducer(tasksReducer, []);

  return (
    <TasksContext.Provider value={{ tasks, dispatch }}>
      {children}
    </TasksContext.Provider>
  );

};