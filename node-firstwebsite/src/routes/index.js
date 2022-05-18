const express = require('express');
const router = express.Router();
const pool = require("./conection");
const bcrypt = require ('bcrypt');
const saltRounds = 10;
// variable para autenticar usuario y password
var auth = function(req, res, next) {
    if (req.session){
        var select = "SELECT * FROM user WHERE username='"+req.session.user+"' AND password='"+req.session.password+"'";
        pool.query(select ,(err,result)=>{
            if(err){
                console.log("No existe session")
            }
            if(result.length==1){
                return next();
            }else{
                res.sendStatus(401);
            }

        })
    }else{
        return res.sendStatus(401);
    }
};
pool.getConnection((err)=>{
    if(err){
        console.log(err);
        return;
    }
    console.log("DB connected");

})
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




router.post('/loggedin', async function(req, res){
    var data = req.body;
    if(!data.username || !data.password){
        res.send("Introduzca datos <a href='log'>VOLVER</a>")
    }else{
        req.session.user = data.username;

        const User = await pool.query("SELECT * FROM user WHERE username='"+req.session.user+"'");
        if(!User){
            res.send("Usuario no existe <a href='log'>Volver</a>")
        }else{
            if(User[0].username === req.session.user){
                res.render('loggedin',{ desc : "LOGOUT from "+User[0].permiss, title: "LOGGED."})
    
            }
        }
        
       // var hashedPassword = "SELECT password FROM user WHERE username='"+req.session.user+"'";
        //var verified = bcrypt.compareSync(data.password,saltRounds);
        //bcrypt.compare(data.password,)

/*         console.log("prequery")
        var infoUser = pool.query(select ,(err,result)=>{
            console.log("respuesta bbdd")
            if(err){
                console.log("No existe este usuario")
            }
            if(result.length==1){
                
                if(result[0].permiss=="ADMIN"){
                    req.session.admin = true;
                }
                res.render('loggedin',{ desc : "LOGOUT from "+result[0].permiss, title: "LOGGED."})
            }else{
                res.send("Usurio y/o contraseña incorrecto <a href='log'>Volver</a>")
            }


        })
        setTimeout( () => {
            console.log(infoUser)

        }, 2000) */
    }
    
})





module.exports = router; // exporta los datos de router