<template>
  <div id="app">
    <!-- Barre de nav -->
    <nav class="navbar navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand">Projet To-Do Liste en Vue.JS</a>
        <div class="d-flex">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Rechercher..."
            class="form-control me-2"
          />
          <button @click="searchTasks" class="btn btn-outline-success">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </nav>
    <!--Insertion tâche -->
    <div class="container mt-5">
      <form
        @submit.prevent="addTask"
        class="d-flex justify-content-between mb-3"
      >
        <div class="col-md-8">
          <p class="choix" style="font-weight: bolder">
            Inserer ici votre nouvelle tâche
          </p>
          <input type="text" v-model="newTask" class="form-control" />
        </div>
        <div class="col-md-2">
          <p class="choix" style="font-weight: bolder">Utilisateur</p>
          <select v-model="selectedUser" class="form-select ms-2">
            <option v-for="user in users" :key="user" :value="user">
              {{ user }}
            </option>
          </select>
        </div>
        <div
          class="col-md-2 d-flex align-items-center"
          style="margin-top: 22px"
        >
          <button type="submit" class="btn btn-warning ms-4">
            Sauvegarder
          </button>
        </div>
      </form>
      <!-- Tableau pour les résultats de recherche -->
      <div class="recherche" v-if="filteredTasks.length">
        <div class="container mt-5">
          <h2>Resultats de la recherche.</h2>
          <div class="mb-3" v-for="task in filteredTasks" :key="task.id">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-10">
                    <h5
                      class="card-title"
                      :class="{
                        'text-decoration-line-through': task.completed,
                      }"
                    >
                      {{ task.name }}
                    </h5>
                  </div>
                  <div class="col-md-2 text-end">
                    <button
                      @click="toggleCompletion(task.id)"
                      :class="[
                        task.completed
                          ? 'btn btn-outline-warning text-black'
                          : 'btn btn-success',
                        'me-2 me-md-3',
                      ]"
                    >
                      <i
                        :class="
                          task.completed ? 'fas fa-history' : 'fas fa-check'
                        "
                      ></i>
                    </button>
                    <button
                      @click="toggleEdit(task)"
                      class="btn btn-primary me-2 me-md-3"
                    >
                      <i
                        :class="task.editing ? 'fas fa-save' : 'fas fa-edit'"
                      ></i>
                    </button>
                    <button
                      @click="confirmDeleteTask(task.id)"
                      class="btn btn-danger me-2 me-md-3"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="clearSearch" class="btn btn-secondary mt-2">
          <i class="fas fa-times"></i> Effacer la recherche
        </button>
      </div>
      <!-- Message si aucune tâche n'est trouvée -->
      <div
        class="alertMessage"
        v-else-if="searchPerformed && showNoResultsMessage"
      >
        <p>
          Aucune tâche correspondant à votre recherche n'a été trouvée. Essayez
          à nouveau.
        </p>
      </div>
      <!-- Tâches -->
      <div class="container mt-5">
        <div class="mb-3" v-for="task in tasks" :key="task.id">
          <div class="card custom-card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-10">
                  <h5
                    class="card-title"
                    :class="{
                      'text-decoration-line-through': task.completed,
                    }"
                  >
                    <span v-if="!task.editing">{{ task.name }}</span>
                    <input
                      v-if="task.editing"
                      v-model="task.newName"
                      type="text"
                      class="form-control"
                    />
                  </h5>
                  <p style="margin-top: 2rem">
                    <span class="task_user" v-if="!task.editing"
                      >Assigné à: {{ task.assignedUser }}</span
                    >
                    <select
                      v-if="task.editing"
                      v-model="task.newAssignedUser"
                      class="form-select"
                    >
                      <option v-for="user in users" :key="user" :value="user">
                        {{ user }}
                      </option>
                    </select>
                  </p>
                </div>
                <div class="col-md-2 text-end">
                  <button
                    @click="toggleCompletion(task.id)"
                    :class="[
                      task.completed
                        ? 'btn btn-outline-warning text-black'
                        : 'btn btn-success',
                      'me-2 me-md-3',
                    ]"
                  >
                    <i
                      :class="
                        task.completed ? 'fas fa-history' : 'fas fa-check'
                      "
                    ></i>
                  </button>
                  <button
                    @click="toggleEdit(task)"
                    class="btn btn-primary me-2 me-md-3"
                  >
                    <i
                      :class="task.editing ? 'fas fa-save' : 'fas fa-edit'"
                    ></i>
                  </button>
                  <button
                    @click="confirmDeleteTask(task.id)"
                    class="btn btn-danger me-2 me-md-3"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      tasks: [],
      newTask: "",
      searchTerm: "",
      filteredTasks: [],
      users: ["toto", "tata", "titi"],
      selectedUser: null,
      searchPerformed: false,
      showNoResultsMessage: false,
    };
  },
  mounted() {
    // Initialize tasks from server
    axios.get("http://localhost:3000/tasks").then((res) => {
      this.tasks = res.data;
    });

    // Listen for changes
    this.$socket.on("taskChange", (task) => {
      const taskToUpdate = this.tasks.find((t) => t.id === task.id);
      Object.assign(taskToUpdate, task);
    });
    // Listen for "taskAdd"
    this.$socket.on("taskAdd", (task) => {
      if (!this.tasks.some((t) => t.id === task.id)) {
        this.tasks.push(task);
      }
    });

    // Listen for "taskDelete"
    this.$socket.on("taskDelete", (id) => {
      this.tasks = this.tasks.filter((task) => task.id !== id);
    });
  },
  methods: {
    addTask() {
      const task = {
        name: this.newTask,
        completed: false,
        assignedUser: this.selectedUser,
      };
      axios.post("http://localhost:3000/tasks", task).catch((err) => {
        console.log(err);
      });
      this.newTask = "";
      this.selectedUser = null;
    },

    toggleEdit(task) {
      if (task.editing) {
        Swal.fire({
          title: "Êtes-vous sûr?",
          text: "Voulez-vous vraiment enregistrer les modifications?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Oui, enregistrer!",
        }).then((result) => {
          if (result.isConfirmed) {
            this.editTask(task);
          }
        });
      } else {
        task.newName = task.name;
        task.newAssignedUser = task.assignedUser;
      }
      task.editing = !task.editing;
    },
    editTask(task) {
      const updatedFields = {};
      if (task.newName !== task.name) {
        updatedFields.name = task.newName;
      }
      if (task.newAssignedUser !== task.assignedUser) {
        updatedFields.assignedUser = task.newAssignedUser;
      }

      if (Object.keys(updatedFields).length > 0) {
        axios
          .put(`http://localhost:3000/tasks/${task.id}`, updatedFields)
          .then(() => {
            if (updatedFields.name) {
              task.name = task.newName;
            }
            if (updatedFields.assignedUser) {
              task.assignedUser = task.newAssignedUser;
            }
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
          text: "Voulez-vous reprendre la tâche ?",
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
      Swal.fire({
        title: "Êtes-vous sûr?",
        text: "Vous ne pourrez pas revenir en arrière !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, supprimer !",
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteTask(id);
          Swal.fire("Supprimé!", "Votre tâche a été supprimée.", "success");
        }
      });
    },
    deleteTask(id) {
      axios.delete(`http://localhost:3000/tasks/${id}`).then(() => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
      });
    },
    searchTasks() {
      this.filteredTasks = this.tasks.filter((task) =>
        task.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.searchPerformed = true;

      if (this.filteredTasks.length === 0) {
        this.showNoResultsMessage = true;
        setTimeout(() => {
          this.showNoResultsMessage = false;
        }, 3000);
      }
    },
    clearSearch() {
      this.filteredTasks = [];
      this.searchTerm = "";
    },
  },
};
</script>
