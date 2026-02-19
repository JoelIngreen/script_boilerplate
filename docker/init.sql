-- Este script se ejecuta automáticamente la primera vez que Postgres arranca
-- (solo si el volumen está vacío)

CREATE TABLE IF NOT EXISTS sensor_data (
  id          SERIAL PRIMARY KEY,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature NUMERIC(5,2),
  humidity    NUMERIC(5,2)
);

-- Datos de prueba
INSERT INTO sensor_data (timestamp, temperature, humidity) VALUES
  (NOW() - INTERVAL '2 hours', 22.5, 60),
  (NOW() - INTERVAL '1 hour',  23.1, 58),
  (NOW(),                       21.8, 62);