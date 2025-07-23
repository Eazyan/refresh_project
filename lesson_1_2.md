
# Урок 1.2: Состояние и события — Итоги

## Что мы изучили и реализовали:

1.  **Состояние (State) и хук `useState`**: Перевели наше приложение со статичных данных на динамическое состояние, которое может изменяться в реальном времени.
2.  **Обработка событий**: Научились работать с событиями `onClick` и `onSubmit` для запуска наших функций.
3.  **Иммутабельное обновление состояния**: Освоили ключевое правило React — никогда не изменять состояние напрямую. Мы использовали правильные подходы:
    *   `.filter()` для создания нового массива при удалении элемента.
    *   Spread-синтаксис `[...tasks, newTask]` для создания нового массива при добавлении элемента.
4.  **Управляемые компоненты**: Создали форму с `<input>`, значение которого полностью контролируется состоянием React.
5.  **Установка и использование внешних библиотек**: Впервые установили внешнюю зависимость (`uuid` и её типы `@types/uuid`) через `npm` для генерации уникальных ID.
6.  **Условный рендеринг (Conditional Rendering)**: Реализовали переключение между кнопкой "Новая задача" и самой формой с помощью тернарного оператора (`условие ? <JSX_A> : <JSX_B>`).
7.  **Стилизация и рефакторинг CSS**: Стилизовали форму добавления и отрефакторили CSS-код для кнопок, используя методологию БЭМ-подобных модификаторов (`.block--modifier`) для лучшей читаемости и поддержки.

---

## Ключевые выводы и важные замечания:

### 1. `const` со стрелочной функцией vs. `function`

Мы подробно разобрали, почему в современном React для объявления функций-обработчиков внутри компонентов предпочтительнее использовать синтаксис `const myFunction = () => {}`:
-   **Консистентность**: Код выглядит единообразно с другими конструкциями React (например, `useState`).
-   **Безопасность `this`**: Отсутствие собственного `this` у стрелочных функций исторически решало множество проблем в классовых компонентах и остается хорошей практикой.
-   **Предсказуемость**: Отсутствие "всплытия" (hoisting) делает поток кода более строгим и понятным.

В итоге мы привели обе наши функции, `handleDeleteTask` и `handleAddTask`, к этому единому стилю.

### 2. Генерация `id` на клиенте

Мы отказались от простого, но ненадежного `Date.now()` в пользу индустриального стандарта — библиотеки `uuid`. Это гарантирует уникальность `id` для каждого нового элемента, что критически важно для стабильной работы React при рендеринге списков.

### 3. Чистота CSS: Рефакторинг с модификаторами

Мы столкнулись с ситуацией, где один и тот же компонент (кнопка) имел разное поведение и стили в зависимости от контекста. Вместо того чтобы переопределять стили (`position: static`), мы применили более чистое решение:
-   **Базовый класс**: `.add-task-button` содержит все общие стили.
-   **Классы-модификаторы**: `.add-task-button--standalone` и `.add-task-button--in-form` добавляют специфичные для контекста стили.

Этот подход делает CSS более предсказуемым, масштабируемым и легким для понимания.

---

## Финальный код урока:

Ниже представлены финальные версии файлов, над которыми мы работали.

### `task-manager/src/App.tsx`
```tsx
import './App.css'
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

function App() {

  const [tasks, setTasks] = useState([
    {id: uuid(), text: 'Изучить хук useState'},
    {id: uuid(), text: 'Научиться удалять задачи'},
    {id: uuid(), text: 'Сделать добавление новых задач'},
  ]);

  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleDeleteTask = (idToDelete: string) => {
    const newTasks = tasks.filter(task => task.id !== idToDelete);
    setTasks(newTasks);
  };

  const handleAddTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() === '') {
      return;
    };

    const newTask = {
      id: uuid(),
      text: inputValue,
    };

    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    setInputValue('');
    setShowInput(false);
  }

  return (
      <div className='app-container'>
        <h1>Мои задачи</h1>

        {showInput ? (
          <form onSubmit={handleAddTask} className='add-task-form'>
            <input 
              type="text"
              placeholder="Что нужно сделать?"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className='add-task-input'
              autoFocus
            />
            <button type="submit" className='add-task-button add-task-button--in-form'>Добавить</button>
          </form>
        ) : (
          <button 
            className='add-task-button add-task-button--standalone'
            onClick={() => setShowInput(true)}
          >
            Новая задача
          </button>
        )}

        <ul className='task-list'>
          {
            tasks.map(task => (
              <li key={task.id} className='task-item' onClick={() => handleDeleteTask(task.id)}>
                {task.text}
              </li>
            ))
          }
        </ul>
      </div>
  )
}

export default App
```

### `task-manager/src/App.css` (только добавленные/измененные стили)
```css
/* ... (старые стили остаются без изменений) ... */

/* === Стили для формы добавления задачи === */

.add-task-form {
  position: absolute;
  top: 28px;
  right: 30px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-task-input {
  width: 200px;
  height: 38px;
  background-color: #232638;
  border: 1px solid #3a3d52;
  border-radius: 20px;
  padding: 0 15px;
  font-size: 0.9rem;
  color: #e0e0e0;
  outline: none;
  transition: border-color 0.2s ease;
}

.add-task-input:focus {
  border-color: #5061FC;
}

/* Общие стили для всех кнопок добавления задач */
.add-task-button {
  height: 38px;
  background-color: #5061FC;
  color: #fff;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(80, 97, 252, 0.2);
}

/* Добавляем иконку + перед текстом кнопки */
.add-task-button::before {
  content: "+";
  font-size: 1.1rem;
  font-weight: 600;
  margin-right: 6px;
}

/* Стили для кнопки в режиме "отдельно стоящая" */
.add-task-button--standalone {
  position: absolute;
  top: 28px;
  right: 30px;
}

/* Эффект при наведении для всех кнопок */
.add-task-button:hover {
  background-color: #4353d9;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(80, 97, 252, 0.3);
}

/* ... (медиа-запросы остаются без изменений) ... */
``` 