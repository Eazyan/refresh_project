import React, { useContext } from 'react';
import TaskItem from "./TaskItem";
import './TaskList.css';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { TasksContext } from '../state/TasksContext';

const TaskList: React.FC = () => {
    const context = useContext(TasksContext);
    if (!context) {
      throw new Error('TaskList must be used within a TasksProvider');
    }
    const { tasks } = context;

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