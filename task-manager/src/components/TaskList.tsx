import React from "react";
import TaskItem from "./TaskItem";
import './TaskList.css';

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
      <ul className='task-list'>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            handleDelete={handleDelete}
          />
        ))}
      </ul>
    );
  };
  
  export default TaskList;