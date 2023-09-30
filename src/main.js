import { createApp } from "vue";
import App from "./App.vue";
import { io } from "socket.io-client";
let socket = io("http://localhost:3000", { autoConnect: true });

const app = createApp(App);
app.config.globalProperties.$socket = socket; // Provide socket to all components

socket.on("connect", function () {
  console.log("connected");
});

app.mount("#app");
