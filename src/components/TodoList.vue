<template>
  <div>
    <h1>Todo List</h1>
    <ul>
      <li v-for="task in tasks" :key="task.id">{{ task.name }}</li>
    </ul>
    <input v-model="newTask" @keyup.enter="addTask" placeholder="New task..." />
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  setup() {
    const tasks = ref([]);
    const newTask = ref("");

    const fetchTasks = async () => {
      const res = await axios.get("http://localhost:3000/tasks");
      tasks.value = res.data;
    };

    const addTask = async () => {
      if (newTask.value) {
        await axios.post("http://localhost:3000/tasks", {
          name: newTask.value,
        });
        newTask.value = "";
        fetchTasks();
      }
    };

    fetchTasks();

    return { tasks, newTask, addTask };
  },
};
</script>
