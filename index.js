const PORT = process.env.PORT || 8083 
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const tec = require('./routes/alumnos')
const fs = require('fs');
const { SwaggerTheme } = require('swagger-themes');
const redoc = require('redoc-express');

app.use(express.json())

const theme = new SwaggerTheme('v3');

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
 
    // setup the logger
    app.use(morgan('combined', { stream: accessLogStream }))
    
    app.get('/', function (req, res) {
    res.send('hello, world!')
});

app.use('/alumnos',tec.router);

const data = fs.readFileSync(`${path.join(__dirname,'./swagger.json')}`);
const defObj = JSON.parse(data);
const read = fs.readFileSync(`${path.join(__dirname,'./README.md')}`,{encoding:'utf8',flag:'r'});
defObj.info.description = read

const swaggerOptions = {
    definition: defObj,
    apis: [`${path.join(__dirname,'./routes/alumnos.js')}`],
};

const options = {
    explorer: true,
    customCss: theme.getBuffer('dark')
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
     
app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocs,options));

app.use("/api-docs-json",(req, res) =>{
    res.json(swaggerDocs)
})

app.get(
    '/api-docs-redoc',
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
