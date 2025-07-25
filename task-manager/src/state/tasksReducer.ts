import { v4 as uuid } from 'uuid';
import type { Action, Task } from './types';

export const tasksReducer = (state: Task[], action: Action): Task[] => {

    switch (action.type) {
  
      case 'ADD_TASK':
        return [ ...state, { id: uuid(), text: action.payload } ];
  
      case 'DELETE_TASK':
        return state.filter(task => task.id !== action.payload);
  
      default:
        return state;
    
      }
  
  };