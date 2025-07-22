import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAZLWL2EhIuH7bvYlkq2k3uvTCiTl13nV8",
  authDomain: "buzzer-asta.firebaseapp.com",
  databaseURL: "https://buzzer-asta-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "buzzer-asta",
  storageBucket: "buzzer-asta.firebasestorage.app",
  messagingSenderId: "61973202498",
  appId: "1:61973202498:web:e7c9d596cf0f9b2bfd0fdb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

import { ref, onValue, set, push } from "firebase/database";

export default function App() {
  const [name, setName] = useState("");
  const [lastBuzz, setLastBuzz] = useState(null);

useEffect(() => {
  const buzzRef = ref(db, "buzz/last");

  const unsubscribe = onValue(buzzRef, (snapshot) => {
    if (snapshot.exists()) {
      const newBuzz = snapshot.val();

      // Reproducir sonido si el timestamp cambió
      setLastBuzz((prev) => {
        if (!prev || prev.timestamp !== newBuzz.timestamp) {
          const audio = new Audio("/like.wav");
          audio.play().catch((e) =>
            console.log("Error al reproducir sonido:", e)
          );
        }
        return newBuzz;
      });
    }
  }, (error) => {
    console.error("Error en onValue:", error);
  });

  return () => unsubscribe();
}, []);

  const handleBuzz = async () => {
    if (!name) return;
    const buzzRef = ref(db, "buzz/last");
    const historyRef = ref(db, "buzz/history");

    const buzzData = {
      name,
      timestamp: Date.now()
    };

    await set(buzzRef, buzzData);
    await push(historyRef, buzzData);
  };
  
  const [history, setHistory] = useState([]);

  useEffect(() => {
  const historyRef = ref(db, "buzz/history");

  onValue(historyRef, (snapshot) => {
    const entries = [];
    snapshot.forEach((child) => {
      entries.push(child.val());
    });

    // Ordenar por timestamp descendente y tomar los 5 más recientes
    const lastFive = entries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    setHistory(lastFive);
  });
}, []);

return (
  <div style={{ textAlign: "center", padding: "2rem" }}>
    <h1>Buzzer de Subasta</h1>
    <input
      type="text"
      placeholder="Tu nombre"
      value={name}
      onChange={(e) => setName(e.target.value)}
      style={{ padding: "0.5rem", fontSize: "1rem", marginBottom: "1rem" }}
    />
    <br />
    <button
      onClick={handleBuzz}
      style={{
        padding: "1rem 2rem",
        fontSize: "1.5rem",
        background: "blue",
        color: "white",
        borderRadius: "1rem",
        border: "none"
      }}
    >
      BUZZ
    </button>

    {lastBuzz && (
      <div style={{ marginTop: "2rem" }}>
        <p>Último en buzzear:</p>
        <h2>{lastBuzz.name}</h2>
        <p>{new Date(lastBuzz.timestamp).toLocaleTimeString()}</p>
      </div>
    )}

    {history.length > 0 && (
      <div style={{ marginTop: "2rem" }}>
        <h3>Historial reciente:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {history.map((item, index) => (
            <li key={index}>
              <strong>{item.name}</strong> —{" "}
              {new Date(item.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
  
