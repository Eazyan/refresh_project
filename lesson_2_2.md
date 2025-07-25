
# Урок 2.2: Продвинутое состояние: `useReducer` и `Context API` — Итоги

## Что мы изучили и реализовали:

1.  **Хук `useReducer`**: Мы перешли от `useState` к `useReducer` для управления всей логикой, связанной с задачами, централизовав и упростив код.
2.  **Концепция Reducer**: Мы создали чистую функцию-редьюсер, которая является единственным источником правды для изменения состояния задач.
3.  **Actions и `dispatch`**: Научились описывать намерения по изменению состояния в виде объектов-команд (actions) и отправлять их в редьюсер с помощью `dispatch`.
4.  **Рефакторинг логики**: Мы вынесли всю логику управления состоянием и связанные с ней типы в отдельную директорию `src/state` для лучшей организации кода.
5.  **`Context API`**: Мы решили проблему "проброса пропсов" (prop drilling), создав глобальный контекст для нашего состояния.
    *   **`createContext`**: Создали "канал" для передачи данных.
    *   **`Provider`**: Создали компонент-обертку, который "транслирует" `state` и `dispatch` всем своим дочерним элементам.
    *   **`useContext`**: Научились "подключаться" к контексту из любого дочернего компонента, чтобы напрямую получать доступ к `state` и `dispatch`.

---

## Ключевые выводы и важные замечания:

### 1. `useReducer` + `Context API` = Мощная связка

Это одна из самых популярных и мощных комбинаций в React для управления состоянием.
-   `useReducer` предоставляет **механизм** для предсказуемого и централизованного обновления состояния.
-   `Context API` предоставляет **механизм** для удобной доставки этого состояния и функции `dispatch` в любую точку приложения.

Вместе они образуют легковесную, но очень эффективную альтернативу большим библиотекам для управления состоянием (таким как Redux) для многих типов приложений.

### 2. Полное разделение ответственности

Благодаря этому уроку наше приложение теперь имеет почти идеальную архитектуру с точки зрения разделения ответственности:
-   **Папка `src/state`**: Содержит ВСЮ бизнес-логику и ВСЕ типы данных, связанные с задачами. Компоненты ничего об этом не знают.
-   **Папка `src/components`**: Содержит только "глупые" компоненты, отвечающие за отображение. Они либо получают данные из контекста, либо управляют своим локальным UI-состоянием (как `TaskForm` с видимостью инпута).
-   **Файл `App.tsx`**: Превратился в чистый компоновочный корень, который просто собирает все части вместе.

### 3. Чистота дочерних компонентов

Особенно ярко преимущество нового подхода видно на компоненте `<TaskList />`. Раньше он принимал `props`, которые ему самому были не нужны, и просто передавал их дальше. Теперь его вызов выглядит так: `<TaskList />`. Он полностью самодостаточен и сам берет все необходимые ему данные из контекста. Это делает код гораздо более читаемым и легким для рефакторинга.

---

## Финальный код урока:

### `task-manager/src/state/types.ts`
```ts
export type Task = {
  id: string;
  text: string;
};

export type Action =
  | { type: 'ADD_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string };
```

### `task-manager/src/state/tasksReducer.ts`
```ts
import { v4 as uuid } from 'uuid';
import { Action, Task } from './types';

export const tasksReducer = (state: Task[], action: Action): Task[] => {
  switch (action.type) {
    case 'ADD_TASK':
      return [
        ...state,
        { id: uuid(), text: action.payload }
      ];
    case 'DELETE_TASK':
      return state.filter(task => task.id !== action.payload);
    default:
      return state;
  }
};
```

### `task-manager/src/state/TasksContext.tsx`
```tsx
import React, { createContext, useReducer } from 'react';
import { tasksReducer } from './tasksReducer';
import { Task, Action } from './types';

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
```

### `task-manager/src/App.tsx`
```tsx
import './App.css';
import { useState } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { TasksProvider } from './state/TasksContext';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (
    <TasksProvider>
      <div className='app-container'>
        <h1>Мои задачи</h1>
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
      </div>
    </TasksProvider>
  );
}

export default App;
```

### `task-manager/src/components/TaskForm.tsx`
```tsx
import React, { useContext } from 'react';
import './TaskForm.css';
import { TasksContext } from '../state/TasksContext'; 

type TaskFormProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  onFormSubmit: () => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ inputValue, onInputChange, onFormSubmit }) => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('TaskForm must be used within a TasksProvider');
  }
  const { dispatch } = context;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() === '') return;

    dispatch({ type: 'ADD_TASK', payload: inputValue });

    onInputChange('');
    onFormSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className='add-task-form'>
      {/* ... JSX-разметка формы ... */}
    </form>
  );
};

export default TaskForm;
```

### `task-manager/src/components/TaskList.tsx`
```tsx
import React, { useContext } from 'react';
import TaskItem from "./TaskItem";
import './TaskList.css';
// ... импорты анимационных библиотек ...
import { TasksContext } from '../state/TasksContext';

const TaskList: React.FC = () => {
    const context = useContext(TasksContext);
    if (!context) {
      throw new Error('TaskList must be used within a TasksProvider');
    }
    const { tasks } = context;

    return (
      // ... JSX-разметка списка с анимациями ...
      // tasks.map(task => <TaskItem key={task.id} task={task} />)
    );
  };
  
  export default TaskList;
```

### `task-manager/src/components/TaskItem.tsx`
```tsx
import React, { useContext } from 'react';
import './TaskItem.css';
import { TasksContext } from '../state/TasksContext';

// ... определение props ...

const TaskItem = React.forwardRef<HTMLLIElement, TaskItemProps>(
  ({ task, className, style }, ref) => {
    const context = useContext(TasksContext);
    if (!context) {
      throw new Error('TaskItem must be used within a TasksProvider');
    }
    const { dispatch } = context;

    const handleDelete = () => {
      dispatch({ type: 'DELETE_TASK', payload: task.id });
    };

    return (
      <li onClick={handleDelete} ref={ref} /* ... */>
        {task.text}
      </li>
    );
  }
);

export default TaskItem;
``` 