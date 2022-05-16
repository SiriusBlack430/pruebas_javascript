const express = require('express');
const router = express.Router();

// variable para autenticar usuario y password
var auth = function(req, res, next) {
    if (req.session && (req.session.user === "amy" || req.session.user ==="pepe"))
      return next();
    else
      return res.sendStatus(401);
};
// pagina para logear
router.get('/log',(req, res)=>{
    req.session.destroy();
    res.render('log',{title : "LOGIN"})
    
})
// pagina de index
router.get('/', (req, res)=>{
    res.render('index', { title : "First Website"});
});
// pagina de contact
router.get('/contact', auth, (req, res)=>{
    if(req.session.admin){
        res.render('contact', { title : "Contact pages for admins"});
    }else{
        res.render('contact', { title : "Contact pages for users"});
    }
});


router.post('/loggedin', function(req, res){
    var data = req.body;

    if(!data.username || !data.password){
        res.send("Introduzca datos <a href='log'>VOLVER</a>")
    }else{
        if(data.username === "amy" && data.password ==="password"){
            req.session.user = "amy";
            req.session.admin = true;
            res.render('loggedin',{ desc : "LOGOUT from ADMIN", title: "LOGGED."})

        }else if(data.username ==="pepe" && data.password === "password"){
            req.session.user ="pepe";
            res.render('loggedin',{ desc : "LOGOUT from normal user", title: "LOGGED."})
        }else{
            res.send("Valores incorrectos <a href='log'>Volver</a>")
           
        }
    }
    
})

module.exports = router; // exporta los datos de router