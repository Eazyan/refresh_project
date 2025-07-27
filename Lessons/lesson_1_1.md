
# Урок 1.1: Настройка окружения и первый компонент — Итоги

## Что мы изучили и реализовали:

1.  **Настройка окружения**: Подготовили стартовый шаблон `React + Vite + TypeScript`.
2.  **Создание React-компонента**: Очистили стандартный шаблон и создали свой главный компонент `App.tsx`.
3.  **Синтаксис JSX**: Научились писать HTML-подобную разметку прямо в TypeScript/JavaScript файлах.
4.  **Отображение списков**: Использовали стандартный метод массивов `.map()` для рендеринга списка элементов из "захардкоженных" данных.
5.  **Атрибут `key`**: Поняли важность уникального ключа `key` для элементов списка для эффективной работы React.
6.  **Продвинутая стилизация (CSS)**: Прошли путь от базовых стилей до создания сложного, адаптивного и визуально приятного интерфейса, вдохновленного профессиональным дизайном.

---

## Ключевые выводы и важные замечания:

### 1. Стилизация, управляемая данными (Data-Driven Styling)

Самый важный вывод урока касается подхода к стилизации. Мы увидели, как AI применил стили к карточкам с помощью псевдокласса `:nth-child()`:

```css
/* Пример "неправильного" подхода для динамического приложения */
.task-item:nth-child(1) { border-bottom: 3px solid #5061FC; }
.task-item:nth-child(2) { border-bottom: 3px solid #4CAF50; }
```

**Проблема**: Стиль жестко привязан к **порядковому номеру** элемента. Если задачи поменять местами, их цвета тоже изменятся, что неверно с точки зрения логики.

**Правильный подход (к которому мы придем)**: Стиль должен зависеть от **данных** самого элемента. В будущем мы добавим к объекту задачи свойство, например `category: 'срочно'`, и будем применять CSS-класс на его основе: `<li className="task-item task-item--urgent">`. Это делает компонент предсказуемым и переиспользуемым.

### 2. Профессиональные техники CSS

В ходе урока мы применили несколько мощных и современных техник CSS, которые являются стандартом в индустрии:

-   **Flexbox и Grid Layout**: Мы использовали `display: flex` для центрирования и `display: grid` для создания адаптивной сетки карточек. Это основа современной верстки.
-   **CSS Reset (`box-sizing: border-box`)**: Применение этого свойства ко всем элементам (`*`) помогает избежать множества проблем с расчетом ширины и высоты блоков.
-   **Центрирование "плавающего окна"**: Мы использовали `display: flex` на `body` (или `#root`), чтобы идеально отцентрировать главный контейнер приложения как по горизонтали, так и по вертикали.
-   **Адаптивность с помощью `@media`**: Мы сразу заложили разное отображение сетки для разных размеров экрана (десктоп, планшет, мобильный).

---

## Финальный код урока:

Ниже представлены финальные версии файлов, которые мы создали.

### `task-manager/src/App.tsx`
```tsx
import './App.css'

function App() {

  const tasks = [
    { id: 1, text: 'Изучить основы React' },
    { id: 2, text: 'Создать компонент списка' },
    { id: 3, text: 'Стилизовать карточки задач' },
    { id: 4, text: 'Понять рендеринг списков' },
    { id: 5, text: 'Добавить адаптивность' },
    { id: 6, text: 'Проанализировать CSS-код' },
    { id: 7, text: 'Подготовить итоги урока' },
  ];

  return (
      <div className='app-container'>
        <h1>Мои задачи</h1>
        <ul className='task-list'>
          {
            tasks.map(task => (
              <li key={task.id} className='task-item'>
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

### `task-manager/src/index.css`
```css
:root {
  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #10121b;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  width: 100%;
  height: 100%;
}

body {
  background: radial-gradient(circle at center, #1e2235 0%, #10121b 100%);
}

#root {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(80, 97, 252, 0.6);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(80, 97, 252, 0.8);
}
```

### `task-manager/src/App.css`
```css
.app-container {
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  max-height: 800px;
  background-color: #1a1e2e;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 20px 30px 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.app-container h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  margin-top: 10px;
  margin-bottom: 25px;
  padding-left: 20px;
  border-left: 4px solid #5061FC;
  flex-shrink: 0; /* Предотвращает сжатие заголовка */
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  flex: 1;
  overflow-y: auto; /* Включаем прокрутку именно для списка */
}

.task-item {
  background-color: #232638;
  color: #fff;
  border-radius: 10px;
  height: 120px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.task-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  background-color: #2a2d40;
}

/* 
  Примечание: Эта стилизация красива, но не идеальна для динамических данных.
  Мы вернемся к этому в следующих уроках.
*/
.task-item:nth-child(1) { border-bottom: 3px solid #5061FC; }
.task-item:nth-child(2) { border-bottom: 3px solid #4CAF50; }
.task-item:nth-child(3) { border-bottom: 3px solid #E91E63; }
.task-item:nth-child(4) { border-bottom: 3px solid #FF9800; }
.task-item:nth-child(5) { border-bottom: 3px solid #00BCD4; }
.task-item:nth-child(6) { border-bottom: 3px solid #9C27B0; }
.task-item:nth-child(7) { border-bottom: 3px solid #F44336; }


/* Добавляем адаптивность для маленьких экранов */
@media (max-width: 992px) {
  .task-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .app-container {
    width: 95%;
    height: 95vh;
    padding: 15px;
  }
  
  .task-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 576px) {
  .task-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 380px) {
    .task-list {
      grid-template-columns: 1fr;
    }
}

``` 