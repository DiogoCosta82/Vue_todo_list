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
            <div class="row">
              <div class="col-md-8" style="text-align: left">
                <input
                  v-if="task.editing"
                  v-model="task.newName"
                  type="text"
                  class="form-control"
                />
                <span v-else>{{ task.name }}</span>
              </div>
              <div class="col-md-4 text-end">
                <button
                  @click="toggleCompletion(task.id)"
                  :class="[
                    task.completed
                      ? 'btn btn-outline-warning text-black'
                      : 'btn btn-success',
                    'me-2',
                  ]"
                >
                  {{ task.completed ? "Annuler Complete" : "Marquer Complete" }}
                </button>
                <button @click="toggleEdit(task)" class="btn btn-primary me-2">
                  {{ task.editing ? "Sauvegarder" : "Modifier" }}
                </button>
                <button
                  @click="confirmDeleteTask(task.id)"
                  class="btn btn-danger me-2"
                >
                  Supprimer
                </button>
              </div>
            </div>
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
    axios.get("http://localhost:3000/tasks").then((res) => {
      this.tasks = res.data.map((task) => ({
        ...task,
        editing: false,
        newName: "",
      }));
    });

    // Listen for changes
    this.$socket.on("taskChanged", (task) => {
      const taskToUpdate = this.tasks.find((t) => t.id === task.id);
      Object.assign(taskToUpdate, task);
    });
  },
  methods: {
    toggleEdit(task) {
      if (task.editing) {
        this.editTask(task);
      } else {
        task.newName = task.name;
      }
      task.editing = !task.editing;
    },
    editTask(task) {
      if (task.newName !== task.name) {
        axios
          .put(`http://localhost:3000/tasks/${task.id}`, { name: task.newName })
          .then(() => {
            task.name = task.newName;
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    toggleCompletion(id) {
      const task = this.tasks.find((t) => t.id === id);
      if (task.completed) {
        Swal.fire({
          title: "Êtes-vous sûr?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Oui, continuer",
        }).then((result) => {
          if (result.isConfirmed) {
            this.updateTask(task, false);
          }
        });
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
</style>
