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