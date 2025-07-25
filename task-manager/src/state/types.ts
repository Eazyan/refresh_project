export type Task = {
    id: string;
    text: string;
};

export type Action =
| { type: 'ADD_TASK'; payload: string }
| { type: 'DELETE_TASK'; payload: string };