const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const port = 3000;

// Middleware para permitir peticiones desde el frontend
app.use(express.json());
app.use(express.static('public'));

// Ruta para buscar por nombre o nut en el JSON
app.get('/buscar', (req, res) => {
    const { searchType, searchQuery } = req.query;

    // Cargar el archivo JSON
    fs.readFile(path.join(__dirname, 'data', 'databook.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo' });
        }

        const jsonData = JSON.parse(data);
        const registros = jsonData.registros;

        let results = [];
        
        // Realizar la búsqueda dependiendo del tipo de búsqueda (nombre o nut)
        if (searchType === 'nombre') {
            results = registros.filter(row => {
                const name = row.socio_demografico.nombre || '';  // Evitar errores si no hay nombre
                return name.toLowerCase().includes(searchQuery.toLowerCase().trim());
            });
        } else if (searchType === 'nut') {
            results = registros.filter(row => 
                row.socio_demografico.nut.includes(searchQuery.trim())
            );
        }

        res.json(results);
    });
});

//FUNCIONES PARA GENERAR API
// Función para construir el NUT y TOKEN
function buildNutAndToken(nut) {
    if (nut.length !== 10) {
        throw new Error("El NUT debe tener exactamente 10 dígitos.");
    }

    const formattedNut = `SMAS${nut[2]}${nut[3]}${nut[4]}V${nut[5]}${nut[6]}RE${nut[7]}${nut[8]}NI${nut[9]}91VCAAA20${nut[0]}I${nut[1]}`;
    const token = `2901VISA${nut[1]}${nut[3]}${nut[5]}${nut[7]}`;

    return { formattedNut, token };
}

// Función para obtener datos desde la API externa
async function fetchDataFromAPI(nut) {
    try {
        const { formattedNut, token } = buildNutAndToken(nut);
        const apiUrl = `https://perpetual-knowledge.com/kripto/service/WS/WS_KRIPTO/TUNGURAHUA_KRIPTO/TITULAR_KRIPTO.php?nut=${formattedNut}&TOKEN=${token}`;
        
        console.log(`Consultando API con URL: ${apiUrl}`);

        const response = await axios.get(apiUrl);
        const xmlData = response.data;

        const parser = new xml2js.Parser({ explicitArray: false });
        const jsonData = await parser.parseStringPromise(xmlData);

        // Asegurar que la estructura de datos sea correcta
        if (jsonData && jsonData.registros && jsonData.registros.socio_demografico) {
            saveDataToJSON(jsonData);
        } else {
            console.log("La API no devolvió datos válidos.");
        }

        return jsonData;
    } catch (error) {
        console.error("Error al obtener datos de la API:", error.message);
        return null;
    }
}


// Método para guardar el JSON en databook.json
function saveDataToJSON(data) {
    const filePath = path.join(__dirname, 'data', 'databook.json'); // Asegurar la ruta correcta

    let jsonData = { registros: [] };

    // Leer el archivo si existe
    if (fs.existsSync(filePath)) {
        try {
            const rawData = fs.readFileSync(filePath, 'utf8');
            if (rawData) {
                jsonData = JSON.parse(rawData);
            }
        } catch (error) {
            console.error("Error al leer el archivo JSON:", error);
            return;
        }
    }

    // Verificar si el registro ya existe para evitar duplicados
    const exists = jsonData.registros.some(registro => registro.socio_demografico?.nut === data.registros?.socio_demografico?.nut);
    
    if (!exists) {
        jsonData.registros.push(data.registros);
        try {
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log("Datos guardados exitosamente en databook.json");
        } catch (error) {
            console.error("Error al escribir en databook.json:", error);
        }
    } else {
        console.log("El NUT ya existe en databook.json, no se guardará duplicado.");
    }
}


// Endpoint para buscar en la API externa cuando no hay datos locales
app.get('/buscarAPI', async (req, res) => {
    const nut = req.query.nut;

    if (!nut || nut.length !== 10) {
        return res.status(400).json({ error: "El NUT debe tener exactamente 10 dígitos." });
    }

    try {
        const apiData = await fetchDataFromAPI(nut);

        if (apiData) {
            res.json(apiData);
        } else {
            res.status(500).json({ error: "No se pudo obtener datos desde la API externa." });
        }
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor." });
    }
});



app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
