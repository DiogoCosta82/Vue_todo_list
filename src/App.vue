<template>
  <div id="app" class="container mt-5">
    <h1 class="text-center mb-4">Vue To-do List</h1>
    <form @submit.prevent="addTask" class="d-flex justify-content-between mb-3">
      <input
        type="text"
        placeholder="Inserer ici votre nouvelle tâche...."
        class="form-control"
      />
      <button type="submit" class="btn btn-primary ms-2">Sauvegarder</button>
    </form>
    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col">Tâches</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td :class="{ 'text-decoration-line-through': task.completed }">
            {{ task.name }}
          </td>
          <td class="text-end">
            <button
              @click="toggleCompletion(task.id)"
              :class="[
                task.completed
                  ? 'btn btn-outline-warning text-black'
                  : 'btn btn-success',
                'me-2',
              ]"
            >
              {{ task.completed ? "Annuler" : "Accomplie" }}
            </button>

            <button
              @click="confirmDeleteTask(task.id)"
              class="btn btn-danger me-2"
            >
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      tasks: [],
    };
  },
  mounted() {
    // Initialize tasks from server
    axios.get("http://localhost:3000/tasks").then((res) => {
      this.tasks = res.data;
    });

    // Listen for changes
    this.$socket.on("taskChanged", (task) => {
      const taskToUpdate = this.tasks.find((t) => t.id === task.id);
      Object.assign(taskToUpdate, task);
    });
  },
  methods: {
    toggleCompletion(id) {
      const task = this.tasks.find((t) => t.id === id);
      if (task.completed) {
        if (
          window.confirm("Do you really want to set this task as incomplete?")
        ) {
          this.updateTask(task, false);
        }
      } else {
        this.updateTask(task, true);
      }
    },
    updateTask(task, completedStatus) {
      axios
        .put(`http://localhost:3000/tasks/${task.id}`, {
          completed: completedStatus,
        })
        .then(() => {
          task.completed = completedStatus;
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style>
body {
  background: linear-gradient(to bottom, #87ceeb, #d3d3d3);
  background-repeat: no-repeat;
  background-attachment: fixed;
}
#app {
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  color: #2c3e50;
}

table {
  width: 100%;
  margin-top: 20px;
}

th {
  text-align: left;
}

.completed {
  text-decoration: line-through;
  color: red;
}

.text-decoration-line-through {
  text-decoration: line-through;
  color: red !important;
}
.completed-task {
  text-decoration: line-through;
  color: red;
}
</style>
