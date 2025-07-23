
# Урок 1.3: Компонентная архитектура — Итоги

## Что мы изучили и реализовали:

1.  **Философия компонентного подхода**: Мы поняли главную идею React — разделение интерфейса на маленькие, независимые и переиспользуемые "кирпичики" (компоненты).
2.  **Рефакторинг**: Мы провели масштабный рефакторинг, разбив наш монолитный `App.tsx` на три отдельных, логичных компонента:
    *   `TaskForm`: Отвечает за отображение формы добавления задачи.
    *   `TaskList`: Отвечает за отображение всего списка задач.
    *   `TaskItem`: Отвечает за отображение одной задачи в списке.
3.  **Props (Свойства)**: Научились передавать данные и функции от родительских компонентов к дочерним. Это ключевой механизм для общения между компонентами.
    *   **Передача данных "вниз"**: `App` -> `TaskList` -> `TaskItem` (например, массив `tasks`).
    *   **Передача функций для колбэков "наверх"**: `App` -> `TaskList` -> `TaskItem` (например, функция `handleDelete`).
4.  **Однонаправленный поток данных**: На практике увидели, как работает этот фундаментальный принцип React. Состояние "живет" в `App`, а дочерние компоненты получают его через `props` и запрашивают его изменение, вызывая переданные им функции.
5.  **Типизация `props`**: Научились описывать "контракт" компонента с помощью TypeScript, делая код более надежным и предсказуемым.
6.  **Инкапсуляция**: Каждый наш компонент теперь содержит свою собственную логику, разметку (JSX) и стили (CSS), что делает их по-настоящему независимыми.

---

## Ключевые выводы и важные замечания:

### 1. Подъём состояния (Lifting State Up)

Это главный принцип, который мы сегодня применили. Изначально мы могли бы попытаться засунуть `inputValue` в состояние компонента `TaskForm`. Но тогда `App` не смог бы получить доступ к этому значению для создания новой задачи.

Поэтому мы "подняли" это состояние наверх, в ближайшего общего предка — в `App`. `App` теперь владеет состоянием, а `TaskForm` просто получает его и функции для его изменения через `props`. Это стандартный и очень мощный паттерн в React.

### 2. Структура проекта

Наш проект обрел профессиональную структуру. Наличие папки `src/components` с отдельными папками или файлами для каждого компонента — это стандарт де-факто для любого React-приложения.

### 3. "Умные" и "Глупые" компоненты

Неофициально, компоненты часто делят на два типа:
-   **Умные (контейнеры)**: Знают о состоянии, содержат логику, получают данные. В нашем случае это `App.tsx`.
-   **Глупые (презентационные)**: Не имеют своего состояния. Просто получают данные через `props` и отображают их. Вся их логика — это отображение. В нашем случае это `TaskForm`, `TaskList` и `TaskItem`.

Стремление к созданию большого количества маленьких "глупых" компонентов делает приложение более тестируемым и легким для понимания.

---

## Финальный код урока:

Теперь наш `App.tsx` выглядит невероятно чисто, а вся сложность инкапсулирована в дочерних компонентах.

### `task-manager/src/App.tsx`
```tsx
import './App.css'
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

function App() {
  const [tasks, setTasks] = useState([
    {id: uuid(), text: 'Разобраться с компонентной архитектурой'},
    {id: uuid(), text: 'Вынести TaskItem в отдельный компонент'},
    {id: uuid(), text: 'Создать TaskList'},
    {id: uuid(), text: 'Отрефакторить форму добавления'},
  ]);

  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleDeleteTask = (idToDelete: string) => {
    const newTasks = tasks.filter(task => task.id !== idToDelete);
    setTasks(newTasks);
  };

  const handleAddTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() === '') return;

    const newTask = {
      id: uuid(),
      text: inputValue,
    };

    setTasks([...tasks, newTask]);
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

### `task-manager/src/components/TaskForm.tsx`
```tsx
import React from 'react';
import './TaskForm.css';

type TaskFormProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  onFormSubmit: (event: React.FormEvent) => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ inputValue, onInputChange, onFormSubmit }) => {
  return (
    <form onSubmit={onFormSubmit} className='add-task-form'>
      <input 
        type="text"
        placeholder="Что нужно сделать?"
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        className='add-task-input'
        autoFocus
      />
      <button type="submit" className='add-task-button add-task-button--in-form'>Добавить</button>
    </form>
  );
};

export default TaskForm;
```
*(Код `TaskList.tsx` и `TaskItem.tsx`, а также их CSS-файлы, также являются частью этого урока, но для краткости мы их здесь опускаем, так как они были созданы на промежуточных шагах).* 