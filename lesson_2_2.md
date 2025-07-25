
# Урок 2.2: Продвинутое состояние: `useReducer` — Итоги

## Что мы изучили и реализовали:

1.  **Хук `useReducer`**: Мы перешли от множества вызовов `useState` к одному `useReducer` для управления всей логики, связанной с задачами. Это позволило нам централизовать и упростить код.
2.  **Концепция Reducer**: Мы создали чистую функцию-редьюсер, которая является единственным источником правды для изменения состояния задач. Она принимает текущее состояние и `action` (команду) и возвращает новое состояние.
3.  **Actions и `dispatch`**: Мы научились описывать наши намерения по изменению состояния в виде объектов-команд (actions) и отправлять их в редьюсер с помощью функции `dispatch`.
4.  **Масштабируемая архитектура состояния**: Мы провели глубокий рефакторинг, вынеся всю логику управления состоянием и связанные с ней типы в отдельную директорию `src/state`.
    *   `src/state/types.ts`: Хранит все TypeScript-типы для нашего состояния (`Task`, `Action`).
    *   `src/state/tasksReducer.ts`: Хранит саму функцию-редьюсер, инкапсулируя в себе всю бизнес-логику.

---

## Ключевые выводы и важные замечания:

### 1. `useState` vs `useReducer`: Когда что использовать?

Мы на практике увидели разницу между двумя хуками:

-   **`useState`**: Идеален для простого, локального состояния компонента, которое не имеет сложной логики обновления (например, состояние `inputValue` или флаг `showInput`).
-   **`useReducer`**: Гораздо лучше подходит, когда:
    -   Состояние имеет сложную структуру (например, массив объектов).
    -   Логика обновления состояния включает в себя несколько разных действий (добавить, удалить, изменить и т.д.).
    -   Следующее состояние зависит от предыдущего.
    -   Вы хотите отделить бизнес-логику от компонента отображения.

Наше приложение стало прекрасным примером гибридного подхода, где для разных задач используются оба хука.

### 2. Организация кода: Разделение ответственности

Наш главный компонент `App.tsx` теперь стал значительно "чище". Он больше не содержит в себе бизнес-логику и описания типов данных. Его ответственность сузилась до:
-   Инициализации состояния.
-   Описания простых обработчиков, которые просто "диспетчируют" команды.
-   Компоновки UI из дочерних компонентов.

Такая организация делает код более читаемым, тестируемым и легким для поддержки в долгосрочной перспективе.

### 3. TypeScript и `useReducer`

Мы увидели, как TypeScript помогает сделать работу с `useReducer` более безопасной. Четкое описание типов `Task` и `Action` с помощью `union type` (`|`) позволяет нам быть уверенными, что мы не сможем отправить в `dispatch` неверную команду или "полезную нагрузку" (`payload`) неправильного типа.

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

### `task-manager/src/App.tsx`
```tsx
import './App.css';
import { useState, useReducer } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { tasksReducer } from './state/tasksReducer';

function App() {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleDeleteTask = (idToDelete: string) => {
    dispatch({ type: 'DELETE_TASK', payload: idToDelete });
  };

  const handleAddTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() === '') return;

    dispatch({ type: 'ADD_TASK', payload: inputValue });
    
    setInputValue('');
    setShowInput(false);
  }

  return (
    <div className='app-container'>
      <h1>Мои задачи</h1>
      {showInput ? (
        <TaskForm
          inputValue={inputValue}
          onInputChange={setInputValue}
          onFormSubmit={handleAddTask}
        />
      ) : (
        <button 
          className='add-task-button add-task-button--standalone'
          onClick={() => setShowInput(true)}
        >
          Новая задача
        </button>
      )}
      <TaskList
        tasks={tasks}
        handleDelete={handleDeleteTask}
      />
    </div>
  )
}

export default App;
``` 