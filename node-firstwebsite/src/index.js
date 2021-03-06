const express = require("express");
const cookieParser = require("cookie-parser"); // cookies
const path = require('path'); // modulo para path
const morgan = require('morgan'); // mensajes de peticiones http
const app = express(); // servidor
const cors = require('cors');
app.use(cors())
app.use(cookieParser());

app.use(express.json());
app.set('port', 3001); // puerto en el que escucha

app.set('views', path.join(__dirname, 'pages')); // redefinir donde estas las paginas

app.set('view engine','ejs'); // motor de plantilla para procesar codigo en html

app.engine('html', require('ejs').renderFile); // archivos .html tratados como .ejs
//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));

// rutas
app.use("/", require("./routes"));

function startServer(){
  app.listen(app.get('port'), ()=>{
    console.log("Server Started")
  })
}
startServer()