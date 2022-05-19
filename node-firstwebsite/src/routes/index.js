const express = require('express');
const router = express.Router();
const pool = require("./conection");
const bcrypt = require ('bcrypt');
const saltRounds = 10;
// variable para autenticar usuario y password
var auth = function(req, res, next) {
    console.log("Session"+ JSON.stringify(req.session))
    if (req.session && req.session.permiss){
        
       return next();

        
    }else{
        return res.sendStatus(401);
    }
};

var authAdmin = function(req, res, next) {
    console.log("Session"+ JSON.stringify(req.session))
    if (req.session && req.session.permiss && req.session.permiss=='ADMIN'){
        
       return next();

        
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
    res.render('log',{title : "LOGIN" , notLogin: false})
    
})
// pagina de index
router.get('/', (req, res)=>{
    res.render('index', { title : "First Website"});
});
// pagina de contact
router.get('/contact', auth, (req, res)=>{
    if(req.session.permiss ==="ADMIN"){
        res.render('contact', { title : "Contact pages for admins"});
    }else{
        res.render('contact', { title : "Contact pages for users"});
    }

});

router.get('/userList', authAdmin, async (req, res)=>{
    var User = await pool.query("SELECT USERNAME,PERMISS FROM USER");

    res.render("userList",{ user : User});

});

router.get('/register',(req, res)=>{
    res.render("register");
})
router.post('/registered', async (req, res)=>{
    var data = req.body;
    if(!data.username || !data.password || !data.confirmPassword){
        res.send('No puede haber campos vacios <a href="register">VOLVER</a>');
    }else{
        
        const User = await pool.query("SELECT * FROM user WHERE username='" + pool.escape(data.username) + "'");
        if(User.length !==0){
            res.send("Usuario ya existe en la base de datos <a href='register'>Volver</a>")
        }else{
            if(data.password == data.confirmPassword){
                
            }else{
                res.send("Contraseñas no coinciden <a href='register'>Volver</a>");
            }
        }
    }
})


router.post('/loggedin', async function(req, res){
    var data = req.body;
    if(!data.username || !data.password){
        res.send("Introduzca datos <a href='log'>VOLVER</a>")
    }else{
        const User = await pool.query("SELECT * FROM user WHERE username='" + data.username + "'");

        if(User.length==0){
            res.redirect(307,'/log')
            //res.send("Usuario no existe en la base de  datos <a href='log'>Volver</a>")
        }else{
            
            
            const compare = await bcrypt.compare(data.password,User[0].password);
            if(compare){
               
                req.session.permiss = User[0].permiss;

                res.render('loggedin',{ desc : "LOGOUT from "+User[0].permiss, title: "LOGGED."})
            }else{
                res.send("Contraseña incorrecta  <a href='log'>Volver</a>")
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