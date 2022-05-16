const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express(); // servidor
const path = require('path'); // modulo para path
const morgan = require('morgan');
const expresValidator = require("express-validator");
app.use(cookieParser());
app.use( session({ // session para la app con sus atributos
    secret: "SECRET",
    saveUninitialized: false,
    resave: true,
    admin: false
}))
app.set('port', 3000); // puerto en el que escucha

app.set('views', path.join(__dirname, 'pages')); // redefinir donde estas las paginas

app.set('view engine','ejs'); // motor de plantilla para procesar codigo en html

app.engine('html', require('ejs').renderFile); // archivos .html tratados como .ejs
//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));


// rutas
app.use("/", require("./routes"));

app.listen(app.get('port'), ()=>{

});