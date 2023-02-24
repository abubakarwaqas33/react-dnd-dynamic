import React, { useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { projectTasks, categories } from "./tasks";
import "./assets/styles/App.css";

const MovableItem = ({ name, id, category, moveCardHandler, setItems }) => {
  const changeItemColumn = (currentItem, category) => {
    setItems((prevState) => {
      const arr = prevState.map((e) => {
        return {
          ...e,
          category: e?.id === currentItem?.id ? category : e?.category,
        };
      });
      return arr;
    });
  };

  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "task",
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.id;
      const hoverIndex = id;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveCardHandler(dragIndex, hoverIndex);
      item.id = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { id, name, category, type: "task" },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();

      if (dropResult) {
        const { category } = dropResult;
        if (dropResult && category) {
          changeItemColumn(item, category);
        }
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  drag(drop(ref));

  return (
    <div ref={ref} className="movable-item" style={{ opacity }}>
      {name}
    </div>
  );
};

const collect = (monitor) => ({
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

const Column = ({ children, className, category }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "task",
    drop: () => ({ category }),
    collect,
    canDrop: (item) => {
      const { category } = item;
      return categories.find((taskCategory) => taskCategory === category);
    },
  });

  const getBackgroundColor = () => {
    if (isOver) {
      if (canDrop) {
        return "rgb(188,251,255)";
      } else if (!canDrop) {
        return "rgb(255,188,188)";
      }
    } else {
      return "";
    }
  };

  return (
    <div
      ref={drop}
      className={className}
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <p>{category}</p>
      {children}
    </div>
  );
};

export const App = () => {
  const [tasks, setTasks] = useState(projectTasks);

  const moveCardHandler = (dragIndex, hoverIndex) => {
    const dragItem = tasks[dragIndex];

    if (dragItem) {
      console.log(dragItem, "dragItem");
      setTasks((prevState) => {
        const coppiedStateArray = [...prevState];
        const prevItem = coppiedStateArray.splice(hoverIndex, 1, dragItem);
        coppiedStateArray.splice(dragIndex, 1, prevItem[0]);
        return coppiedStateArray;
      });
    }
  };

  const returnItemsForColumn = (category) => {
    return tasks
      .filter((task) => task?.category === category)
      .map((task) => (
        <MovableItem
          key={task?.id}
          name={task?.name}
          category={task?.category}
          setItems={setTasks}
          id={task?.id}
          moveCardHandler={moveCardHandler}
        />
      ));
  };

  return (
    <div className="container">
      <DndProvider backend={HTML5Backend}>
        {categories.map((category) => (
          <Column
            category={category}
            className="column do-it-column"
            key={category}
          >
            {returnItemsForColumn(category)}
          </Column>
        ))}
      </DndProvider>
    </div>
  );
};
