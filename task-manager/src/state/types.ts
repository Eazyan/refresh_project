export type Task = {
    id: string;
    text: string;
};

export type Action =
| { type: 'ADD_TASK'; payload: Task }
| { type: 'DELETE_TASK'; payload: string }
| { type: 'SET_TASKS'; payload: Task[] };