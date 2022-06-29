const express = require('express');
const router = express.Router();
const pool = require("./conection");
const fetch = require('node-fetch');
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

// pagina de index

// pagina de contact
router.get('/contact', auth, (req, res)=>{
    if(req.session.permiss ==="ADMIN"){
        res.render('contact', { title : "Contact pages for admins"});
    }else{
        res.render('contact', { title : "Contact pages for users"});
    }
    
});

router.get('/userList', async (req, res)=>{
    var User = await pool.query("SELECT id,username,permiss FROM USER");
    res.header("Access-Control-Allow-Origin","http://localhost:3000");
    res.send({User});    
});


router.post('/registered', async (req, res)=>{
    var data = req.body;
    if(!data.username || !data.password || !data.confirmPassword){
        res.send('No puede haber campos vacios <a href="register">VOLVER</a>');
    }else{
        try{
            const User = await pool.query("SELECT * FROM USER WHERE username= ?",data.username);
            if(User.length !==0){
                res.render("register",{title: "REGISTER", userNotCorrect: true,passNotMatch:false})
            }else{
                if(data.password == data.confirmPassword){
                    const hashedPassword = await bcrypt.hash(data.password,saltRounds);
                    const num = await pool.query("SELECT MAX(id) as id FROM USER");
                    await pool.query("ALTER TABLE USER AUTO_INCREMENT = ?",num[0].id);
                    await pool.query("INSERT INTO USER(username,password,permiss) VALUES(?,?,?)",[data.username,hashedPassword,"USER"],function(e,result){
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
        
        const User = await pool.query("SELECT * FROM USER WHERE username= ?",data.username);
        
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

router.get('/userList/delete', async (req,res)=>{
    const id = req.query.id;
    var User = await pool.query("SELECT permiss FROM USER WHERE id= ?",id);
    console.log(User)
    if(User){
        if(User[0].permiss != "ADMIN"){
            await pool.query("DELETE FROM USER WHERE id= ?", id);
            
        }
        
    }else{
        console.log("NO ENCONTRADO")
    }
    
    res.redirect("/userList");
    
})
router.get('/userList/edit', async (req,res)=>{
    const id = req.query.id;
    var User = await pool.query("SELECT id,username,permiss FROM USER WHERE id= ?",id);
    if(User.length!=0){
        res.render('edit',{user: User[0]});
        return
    }
    res.redirect('/userList')
    
    
})
//Modificar username y permisos
router.post('/userList',authAdmin, async(req,res)=>{
    const id = req.query.id;
    var data = req.body;i
    await pool.query("UPDATE USER Set username = ? ,permiss = ? WHERE id= ?", [data.username,data.privileges,id]);
    res.redirect("/userList");
})

router.get('/userList/edit/passChange' , async(req,res)=>{
    const id = req.query.id;
    var User = await pool.query("SELECT id,username,permiss FROM USER WHERE id=?", id);
    
    res.render('passChange',{user : User[0],passNotMatch:false,actual:false});
})
//Cambiar contraseña
router.post('/userList/edit', async (req,res)=>{
    const id = req.query.id;
    const data = req.body;
    const User = await pool.query("SELECT * FROM USER WHERE id= ?",id);
    const compare = await bcrypt.compare(data.actualPass,User[0].password);
    if(compare){
        if(data.newPass == data.confirmNewPass){
            const hashedPassword = await bcrypt.hash(data.newPassword,saltRounds);
            await pool.query("UPDATE USER Set password = ? WHERE id= ?",[hashedPassword, id]);
            res.redirect('/userList/edit');
        }else{
            res.render('passChange',{user : User[0],passNotMatch:true,actual:false});
            return;
        }
    }
    res.render('passChange',{user: User[0],passNotMatch:false,actual : true})
    
})

module.exports = router; // exporta los datos de router