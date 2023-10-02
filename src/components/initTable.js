const r = require("rethinkdb");

async function initDB() {
  let connection = null;

  try {
    // Établir la connexion
    connection = await r.connect({ host: "127.0.0.1", port: 28015 });

    // Créer la base de données (ignore l'erreur si la base de données existe déjà)
    try {
      await r.dbCreate("todoListDB").run(connection);
      console.log("Database created: todoListDB");
    } catch (err) {
      console.log("Database already exists: todoListDB");
    }

    // Utiliser la base de données
    connection.use("todoListDB");

    // Créer la table (ignore l'erreur si la table existe déjà)
    try {
      await r.tableCreate("tasks").run(connection);
      console.log("Table created: tasks");
    } catch (err) {
      console.log("Table already exists: tasks");
    }
  } catch (error) {
    console.error("Error occurred: ", error);
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

// Appel de la fonction pour initialiser la base de données et la table
initDB();
