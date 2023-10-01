<template>
  <div id="app" class="container mt-5">
    <h1 class="text-center mb-4">Vue To-do List</h1>
    <form @submit.prevent="addTask" class="d-flex justify-content-between mb-3">
      <input
        type="text"
        v-model="newTask"
        placeholder="Inserer ici votre nouvelle tâche...."
        class="form-control"
      />
      <button type="submit" class="btn btn-primary ms-2">Sauvegarder</button>
    </form>
    <table class="table table-dark table-hover table-equal-width">
      <thead>
        <tr>
          <th class="col-md-10">Tâches</th>
          <th class="col-md-2 text-end">
            <div class="search-box">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Rechercher..."
                class="search-input"
              />
              <button @click="searchTasks" class="search-button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id" class="table-equal-width">
          <td :class="{ 'text-decoration-line-through': task.completed }">
            <div class="row">
              <div class="col-md-10" style="text-align: left">
                <input
                  v-if="task.editing"
                  v-model="task.newName"
                  type="text"
                  class="form-control"
                />
                <span v-else>{{ task.name }}</span>
              </div>
              <div class="col-md-2 text-end">
                <button
                  @click="toggleCompletion(task.id)"
                  :class="[
                    task.completed
                      ? 'btn btn-outline-warning text-black'
                      : 'btn btn-success',
                    'me-2',
                  ]"
                >
                  <i
                    :class="task.completed ? 'fas fa-times' : 'fas fa-check'"
                  ></i>
                </button>
                <button @click="toggleEdit(task)" class="btn btn-primary me-2">
                  <i :class="task.editing ? 'fas fa-save' : 'fas fa-edit'"></i>
                </button>
                <button
                  @click="confirmDeleteTask(task.id)"
                  class="btn btn-danger me-2"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="filteredTasks.length">
      <h2>Ma recherche des tâches</h2>
      <table class="table table-dark table-hover">
        <thead>
          <tr>
            <th scope="col">Résultats de recherche</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id">
            <td>{{ task.name }}</td>
          </tr>
        </tbody>
      </table>
      <button @click="clearSearch" class="btn btn-secondary mt-2">
        <i class="fas fa-times"></i> Effacer la recherche
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      tasks: [],
      newTask: "",
      searchTerm: "",
      filteredTasks: [],
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
    addTask() {
      const task = { name: this.newTask, completed: false };
      axios
        .post("http://localhost:3000/tasks", task)
        .then((res) => {
          this.tasks.push({
            ...task,
            id: res.data.id,
            editing: false,
            newName: "",
          });
        })
        .catch((err) => {
          console.log(err);
        });
      this.newTask = "";
    },

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
    confirmDeleteTask(id) {
      const confirmed = window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette tâche ?"
      );
      if (confirmed) {
        this.deleteTask(id);
      }
    },
    deleteTask(id) {
      axios.delete(`http://localhost:3000/tasks/${id}`).then(() => {
        // Enlever la tâche de l'état local
        this.tasks = this.tasks.filter((t) => t.id !== id);
      });
    },
    searchTasks() {
      this.filteredTasks = this.tasks.filter((task) =>
        task.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    clearSearch() {
      this.filteredTasks = [];
      this.searchTerm = "";
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

.completed {
  text-decoration: line-through;
  color: red;
}

.text-decoration-line-through {
  text-decoration: line-through;
  color: red !important;
}

.table-equal-width {
  width: 100%;
  table-layout: fixed;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 5px 30px 5px 5px; /* padding-right à 30px pour faire de la place pour le bouton */
}

.search-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
}

.form-control-sm {
  width: auto;
}
</style>
