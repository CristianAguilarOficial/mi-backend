import app from "./app.js";
import { connectDB } from "./db.js";

connectDB();

// Usar el PORT de Railway o 3000 en local
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
