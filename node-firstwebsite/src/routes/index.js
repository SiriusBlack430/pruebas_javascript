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
    res.render('log',{title : "LOGIN" , notCorrect: false})
    
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
    var User = await pool.query("SELECT * FROM USER");

    res.render("userList",{ user : User});

});

router.get('/register',(req, res)=>{
    res.render("register",{title: "REGISTER",userNotCorrect:false,passNotMatch: false});
})
router.post('/registered', async (req, res)=>{
    var data = req.body;
    if(!data.username || !data.password || !data.confirmPassword){
        res.send('No puede haber campos vacios <a href="register">VOLVER</a>');
    }else{
        try{
            const User = await pool.query("SELECT * FROM USER WHERE username=" + pool.escape(data.username));
            if(User.length !==0){
                res.render("register",{title: "REGISTER", userNotCorrect: true,passNotMatch:false})
            }else{
                if(data.password == data.confirmPassword){
                    const hashedPassword = await bcrypt.hash(data.password,saltRounds);
                    const userValues = {
                        username : data.username,
                        password : hashedPassword,
                        permiss : "USER"
                    }
                    await pool.query("INSERT INTO USER SET ? ",userValues,function(e,result){
                        if(e){
                            res.send("ERROR REGISTRANDO")
                        }
                        res.render("registered",{title: "REGISTERED",userNotCorrect:false,passNotMatch:false});

                    });
                }else{
                    res.render('register',{title:"REGISTER",userNotCorrect:false,passNotMatch:true});
                }
            }
        }catch(e){
            console.log(e)
        }
        
    }
})


router.post('/loggedin', async function(req, res){
    var data = req.body;
    if(!data.username || !data.password){
        res.send('No puede haber campos vacios <a href="log">VOLVER</a>');
    }else{

        const User = await pool.query("SELECT * FROM USER WHERE username='" + data.username + "'");

        if(User.length==0){
            res.render('log',{ notCorrect: true, title: "LOGIN"});
        }else{
            
            const compare = await bcrypt.compare(data.password,User[0].password);
            if(compare){
            
                req.session.permiss = User[0].permiss;

                res.render('loggedin',{ permiss : User[0].permiss, title: "LOGGED."})
            }else{
                res.render('log',{ notCorrect: true, title: "LOGIN"});
            }  
        }
    }
    
})


module.exports = router; // exporta los datos de router