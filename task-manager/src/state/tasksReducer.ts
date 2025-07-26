import type { Action, Task } from './types';

export const tasksReducer = (state: Task[], action: Action): Task[] => {

    switch (action.type) {
        
        case 'ADD_TASK':
            return [ ...state, action.payload ];
  
        case 'DELETE_TASK':
            return state.filter(task => task.id !== action.payload);

        case 'SET_TASKS':
            return action.payload;
  
        default:
            return state;
    
    }
  
  };