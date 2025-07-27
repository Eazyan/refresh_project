
# Урок 2.1: Стилизация и анимации — Итоги

## Что мы изучили и реализовали:

1.  **Анимация появления и исчезновения**: Поняли проблему анимации компонентов, которые удаляются из DOM. Для ее решения мы использовали стандартную библиотеку `react-transition-group`.
    *   `<TransitionGroup>`: Компонент-обертка для всего списка, который отслеживает добавление/удаление дочерних элементов.
    *   `<CSSTransition>`: Компонент-обертка для каждого элемента, который динамически добавляет и удаляет CSS-классы (`-enter`, `-enter-active`, `-exit`, `-exit-active`) для запуска анимаций.

2.  **Решение проблемы `findDOMNode`**: Мы столкнулись с ошибкой, вызванной устаревшим API `findDOMNode` в `React.StrictMode`. Мы решили ее современным способом:
    *   **`React.forwardRef`**: Модифицировали наш компонент `TaskItem`, чтобы он мог принимать `ref` и "пробрасывать" его на реальный DOM-элемент (`<li>`).
    *   **`nodeRef`**: Использовали специальный проп `nodeRef` в компоненте `<CSSTransition>`, чтобы явно указать ему, с каким DOM-узлом работать, отключая таким образом использование `findDOMNode`.

3.  **Анимация перемещения (FLIP)**: Мы улучшили UX нашего приложения, добавив плавную анимацию перемещения оставшихся элементов при удалении одного из них. Для этого мы использовали библиотеку `react-flip-toolkit`.
    *   `<Flipper>`: Компонент-обертка для всего анимируемого блока. С помощью пропа `flipKey` он понимает, когда нужно запускать анимацию.
    *   `<Flipped>`: Компонент-обертка для каждого отдельного элемента, который мы хотим анимировать. Проп `flipId` служит уникальным идентификатором для отслеживания элемента.

4.  **Установка внешних зависимостей**: Мы продолжили практику работы с `npm`, установив две новые библиотеки и их TypeScript-типы.

---

## Ключевые выводы и важные замечания:

### 1. Композиция библиотек

Этот урок — отличный пример того, как в реальной разработке для решения одной задачи (анимации списка) часто комбинируются несколько специализированных библиотек. Каждая из них хорошо делает свою часть работы: одна отвечает за появление/исчезновение, другая — за перемещение.

### 2. Важность `ref`

Мы на практике убедились в важности механизма `ref` в React. Это не просто "способ получить доступ к DOM-элементу". Это ключевой инструмент для интеграции со сторонними библиотеками, которые напрямую манипулируют DOM (анимационные библиотеки, D3.js, карты и т.д.). Умение правильно использовать `forwardRef` и `nodeRef` — признак глубокого понимания React.

### 3. "Живой" интерфейс

Даже простые и быстрые анимации кардинально меняют восприятие приложения. Оно перестает быть просто набором элементов и становится отзывчивым, "живым" интерфейсом, который приятно использовать. Инвестиции во frontend-анимации почти всегда окупаются улучшенным пользовательским опытом.

---

## Финальный код урока:

Ниже представлены финальные версии ключевых файлов, которые мы изменили в этом уроке.

### `task-manager/src/components/TaskList.tsx`
```tsx
import React from "react";
import TaskItem from "./TaskItem";
import './TaskList.css';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Flipper, Flipped } from 'react-flip-toolkit';

type Task = {
    id: string;
    text: string;
};

type TaskListProps = {
    tasks: Task[];
    handleDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, handleDelete }) => {
    return (
      <Flipper flipKey={tasks.map(t => t.id).join('')}>
        <TransitionGroup component="ul" className='task-list'>
          {tasks.map(task => {
            const nodeRef = React.createRef<HTMLLIElement>();
            return (
              <CSSTransition
                key={task.id}
                nodeRef={nodeRef}
                timeout={300}
                classNames="task-anim"
              >
                <Flipped flipId={task.id}>
                  <TaskItem
                    ref={nodeRef}
                    task={task}
                    handleDelete={handleDelete}
                  />
                </Flipped>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </Flipper>
    );
  };
  
  export default TaskList;
```

### `task-manager/src/components/TaskItem.tsx`
```tsx
import React from 'react';
import './TaskItem.css';

type TaskItemProps = {
  task: {
    id: string;
    text: string;
  };
  handleDelete: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
};

const TaskItem = React.forwardRef<HTMLLIElement, TaskItemProps>(
  ({ task, handleDelete, className, style }, ref) => {
    return (
      <li
        className={`task-item ${className || ''}`}
        style={style}
        onClick={() => handleDelete(task.id)}
        ref={ref}
      >
        {task.text}
      </li>
    );
  }
);

export default TaskItem;
```

### `task-manager/src/components/TaskItem.css` (только добавленные стили)
```css
/* ... (старые стили остаются без изменений) ... */

/* === Стили для анимации появления/исчезновения === */

/* Начальное состояние, когда элемент появляется */
.task-anim-enter {
  opacity: 0;
  transform: scale(0.8);
}

/* Конечное состояние, к которому элемент анимируется при появлении */
.task-anim-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity 300ms ease-in, transform 300ms ease-in;
}

/* Начальное состояние, когда элемент начинает исчезать */
.task-anim-exit {
  opacity: 1;
  transform: scale(1);
}

/* Конечное состояние, к которому элемент анимируется при исчезании */
.task-anim-exit-active {
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 300ms ease-in, transform 300ms ease-in;
}
``` 