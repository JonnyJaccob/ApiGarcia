const PORT = 8883 ;
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { SwaggerTheme } = require('swagger-themes');
const redoc = require('redoc-express');
var mysql = require('mysql2/promise');

const cors = require('cors');
app.use(cors());


app.use(express.json())

const theme = new SwaggerTheme('v3');

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
 
    // setup the logger
    app.use(morgan('combined', { stream: accessLogStream }))
    
    app.get('/', function (req, res) {
    res.send('hello, world!')
});

const dataDeBase = {
    host: process.env.HOST || 'localhost' , 
    user: process.env.USER || 'root' ,
    password: process.env.PASSWORD || '',
    database: process.env.DATABASE || 'ejemplo',
    port: process.env.PORT || 3306
}
console.log(dataDeBase)
/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
app.get('/hello', (req, res) => {
    res.send('Hello World!');
})

/**
 * @swagger
 * /alumnos:
 *   get:
 *     summary: Obtener lista de alumnos
 *     tags:
 *       - alumnos
 *     description: Obtiene una lista de todos los alumnos.
 *     responses:
 *       200:
 *         description: Lista de alumnos obtenida con éxito.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 nombre: "Juan"
 *                 apellido : "Perez"
 *               - id: 2
 *                 nombre: "Maria"
 *                 apellido : "Rodriguez"
 *       404:
 *         description: No se encontraron alumnos.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "No hay alumnos registrados"
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Error de conexión"
 *               tipo: "Mensaje de error específico"
 *               sql: "Mensaje SQL específico"
 */
app.get('/alumnos/',async (req,res) =>{
    try{
        const conexion = await mysql.createConnection(dataDeBase);
        const [rows, fields] = await conexion.query('select * from nombre ');
        if(rows.length == 0){
            res.status(404);
            res.json({mensaje:"Usuario no existe"})
        }else{
            res.json(rows);
        }
    }catch(err){
        res.status(500).json({mensaje: "Error de conexion",tipo: err.message, sql : err.sqlMessage})
    }
})

/**
 * @swagger
 * /alumnos/{id}:
 *   get:
 *     summary: Obtener un alumno por ID
 *     tags:
 *       - alumnos
 *     description: Obtiene información de un alumno específico según su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del alumno a obtener.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Información del alumno obtenida con éxito.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               nombre: "Juan"
 *               apellido : "Perez"
 *       404:
 *         description: Alumno no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Alumno no encontrado"
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Error de conexión"
 *               tipo: "Mensaje de error específico"
 *               sql: "Mensaje SQL específico"
 */
app.get('/alumnos/:id', async (req, res) => {
    try {
        const conexion = await mysql.createConnection(dataDeBase);
        const [rows, fields] = await conexion.query('SELECT * FROM nombre WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            res.status(404).json({ mensaje: "Alumno no encontrado" });
        } else {
            res.json(rows[0]); // Se asume que el ID es único, por lo tanto, se toma el primer resultado.
        }
    } catch (err) {
        res.status(500).json({ mensaje: "Error al procesar la solicitud", tipo: err.message, sql: err.sqlMessage });
    }
});


/**
 * @swagger
 * /alumnos:
 *   post:
 *     summary: Crear un nuevo alumno
 *     tags:
 *       - alumnos
 *     description: Crea un nuevo alumno con el nombre y apellido proporcionados.
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             nombre: "Juan"
 *             apellido: "Perez"
 *     responses:
 *       201:
 *         description: Alumno creado exitosamente.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Alumno creado exitosamente"
 *       400:
 *         description: Los campos 'nombre' y 'apellido' son obligatorios.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Los campos 'nombre' y 'apellido' son obligatorios"
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Error al crear el alumno"
 *               tipo: "Mensaje de error específico"
 *               sql: "Mensaje SQL específico"
 */
app.post("/alumnos/", async (req, resp) => {
    try {
        let nombre, apellido;

        if (req.body && req.body.nombre && req.body.apellido) {
            nombre = req.body.nombre;
            apellido = req.body.apellido;
        } else {
            resp.status(400).json({ mensaje: "Los campos 'nombre' y 'apellido' son obligatorios" });
            return;
        }

        const conexion = await mysql.createConnection(dataDeBase);
        const sql = 'INSERT INTO nombre (nombre, apellido) VALUES (?, ?)';
        const [result] = await conexion.execute(sql, [nombre, apellido]);

        if (result.affectedRows === 1) {
            resp.status(201).json({ mensaje: "Alumno creado exitosamente" });
        } else {
            resp.status(500).json({ mensaje: "Error al crear el alumno" });
        }
    } catch (err) {
        resp.status(500).json({ mensaje: "Error de conexión", tipo: err.message, sql: err.sqlMessage });
    }
});


/**
 * @swagger
 * /alumnos/{idUsuario}:
 *   delete:
 *     summary: Eliminar un alumno por ID
 *     tags:
 *       - alumnos
 *     description: Elimina un alumno específico según su ID.
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         description: ID del alumno a eliminar.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Registro eliminado con éxito.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Registro eliminado"
 *       404:
 *         description: Registro no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Registro no encontrado"
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Error de conexión"
 *               tipo: "Mensaje de error específico"
 *               sql: "Mensaje SQL específico"
 */
app.delete("/alumnos/:idUsuario", async (req, resp) => {
    try {
        const idUsuario = req.params.idUsuario;
        //console.log(idUsuario)
        if (!idUsuario) {
            resp.status(400).json({ mensaje: "El parámetro 'idUsuario' es obligatorio en la consulta" });
            return;
        }

        const conexion = await mysql.createConnection(dataDeBase);
        const query = 'DELETE FROM nombre WHERE id = ?';
        const [result] = await conexion.execute(query, [idUsuario]);

        if (result.affectedRows === 0) {
            resp.json({ mensaje: "Registro no encontrado" });
        } else {
            resp.json({ mensaje: "Registro eliminado" });
        }
    } catch (err) {
        resp.status(500).json({ mensaje: "Error de conexión", tipo: err.message, sql: err.sqlMessage });
    }
});

/**
 * @swagger
 * /alumnos/{IdUsuario}:
 *   put:
 *     summary: Actualizar un alumno por ID
 *     tags:
 *       - alumnos
 *     description: Actualiza un alumno específico según su ID.
 *     parameters:
 *       - in: path
 *         name: IdUsuario
 *         required: true
 *         description: ID del alumno a actualizar parcialmente.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: nombre
 *         required: true
 *         description: Nuevo nombre del alumno.
 *         schema:
 *           type: string
 *           example: "Juan"
 *       - in: query
 *         name: apellido
 *         required: true
 *         description: Nuevo apellido del alumno.
 *         schema:
 *           type: string
 *           example: "Perez"
 *     responses:
 *       200:
 *         description: Registro actualizado con éxito.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Registro tuvo cambios"
 *       404:
 *         description: Registro no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Registro sin cambios"
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Error de conexión"
 *               tipo: "Mensaje de error específico"
 *               sql: "Mensaje SQL específico"
 */
app.put("/alumnos/:IdUsuario", async (req, resp) => {
    try {
        const IdUsuario = req.params.IdUsuario;
        const nombre = req.query.nombre;
        const apellido = req.query.apellido;

        if (!IdUsuario || isNaN(IdUsuario)) {
            resp.status(400).json({ mensaje: "El parámetro 'IdUsuario' es obligatorio y debe ser un número" });
            return;
        }

        if (!nombre && !apellido) {
            resp.status(400).json({ mensaje: "Se debe proporcionar al menos un campo (nombre o apellido) para actualizar" });
            return;
        }

        const conexion = await mysql.createConnection(dataDeBase);
        let updates = [];
        let values = [];

        if (nombre) {
            updates.push('nombre = ?');
            values.push(nombre);
        }

        if (apellido) {
            updates.push('apellido = ?');
            values.push(apellido);
        }

        const sql = `UPDATE nombre SET ${updates.join(', ')} WHERE id = ?`;
        values.push(IdUsuario);

        const [rows, fields] = await conexion.query(sql, values);

        if (rows.affectedRows === 0) {
            resp.json({ mensaje: "Registro sin cambios" });
        } else {
            resp.json({ mensaje: "Registro tuvo cambios" });
        }
    } catch (err) {
        resp.status(500).json({ mensaje: "Error de conexión", tipo: err.message, sql: err.sqlMessage });
    }
});


/**
 * @swagger
 * /alumnos/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un alumno por ID
 *     tags:
 *       - alumnos
 *     description: Actualiza parcialmente un alumno específico según su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del alumno a actualizar parcialmente.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: nombre
 *         description: Nuevo nombre del alumno.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Juan"
 *       - in: query
 *         name: apellido
 *         description: Nuevo apellido del alumno.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Pérez"
 *     responses:
 *       200:
 *         description: Registro actualizado parcialmente con éxito.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Usuario actualizado exitosamente"
 *       400:
 *         description: Usuario no encontrado o ningún campo proporcionado para actualizar.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Usuario no encontrado"
 *       500:
 *         description: Error al procesar la solicitud.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Error de conexión"
 *               tipo: "Mensaje de error específico"
 *               sql: "Mensaje SQL específico"
 */
app.patch("/alumnos/:id", async (req, resp) => {
    try {
        const id = req.params.id;
        const nombre = req.query.nombre;
        const apellido = req.query.apellido;

        if (!nombre && !apellido) {
            resp.status(400).json({ mensaje: "Ningún campo proporcionado para actualizar" });
            return;
        }

        const conexion = await mysql.createConnection(dataDeBase);
        let updates = [];
        let values = [];

        if (nombre !== undefined) {
            updates.push('nombre = ?');
            values.push(nombre);
        }

        if (apellido !== undefined) {
            updates.push('apellido = ?');
            values.push(apellido);
        }

        const sql = `UPDATE nombre SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);
        console.log(sql)
        const [result] = await conexion.execute(sql, values);

        if (result.affectedRows === 0) {
            resp.status(404).json({ mensaje: "Usuario no encontrado" });
        } else {
            resp.json({ mensaje: "Usuario actualizado exitosamente" });
        }
    } catch (err) {
        resp.status(500).json({ mensaje: "Error de conexión", tipo: err.message, sql: err.sqlMessage });
    }
});



const data = fs.readFileSync(`${path.join(__dirname,'./swagger.json')}`);
const defObj = JSON.parse(data);
const read = fs.readFileSync(`${path.join(__dirname,'./README.md')}`,{encoding:'utf8',flag:'r'});
defObj.info.description = read

const swaggerOptions = {
    definition: defObj,
    apis: [`${path.join(__dirname,'./prod.js')}`],
    schemes: ["http", "https"],
};
swaggerOptions.definition.servers = [{  url: `http://${'https://apigarcia.onrender.com'|| 'localhost'}:${PORT}` }]
const options = {
    explorer: true,
    customCss: theme.getBuffer('dark')
};
//console.log(swaggerOptions)
//console.log("server: ",swaggerOptions.definition.servers)
const swaggerDocs = swaggerJSDoc(swaggerOptions);
     
app.use("/api-docs",cors(),swaggerUI.serve,swaggerUI.setup(swaggerDocs,options));

app.use("/api-docs-json",(req, res) =>{
    res.json(swaggerDocs)
})

app.get(
    '/api-docs-redoc',
    cors(), // Agregar el middleware cors aquí
    redoc({
      title: 'API Docs',
      specUrl: '/api-docs-json',
      nonce: '', // <= it is optional,we can omit this key and value
      // we are now start supporting the redocOptions object
      // you can omit the options object if you don't need it
      // https://redocly.com/docs/api-reference-docs/configuration/functionality/
      redocOptions: {
        theme: {
          colors: {
            primary: {
              main: '#6EC5AB'
            }
          },
          typography: {
            fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
            fontSize: '15px',
            lineHeight: '1.5',
            code: {
              code: '#87E8C7',
              backgroundColor: '#4D4D4E'
            }
          },
          menu: {
            backgroundColor: '#ffffff'
          }
        }
      }
    })
  );
app.listen(PORT,(req,resp)=>{
    console.log("Servidor express escuchando: - " + PORT);
});
