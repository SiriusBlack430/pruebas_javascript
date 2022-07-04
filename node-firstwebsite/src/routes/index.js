const express = require('express');
const router = express.Router();
const user = require("./user");
const issue = require("./issue");
const pool = require("./conection");
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');

function generateAccessToken(username){
    return jwt.sign(username,'SECRET');
}
 function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401);
    try{
        const decodedUser = jwt.verify(token,'SECRET')

        next()
    }catch(e){
        console.log("Token incorrecto")
    }
    
}
/* router.get('/', (req, res)=>{
    
    res.render('index', { title : "First Website"});
});
router.get('/log',(req, res)=>{
    req.session.destroy();

    res.render('log',{title : "LOGIN" , notCorrect: false})

}) */
router.post('/log',async (req,res)=>{
    var data = req.body;
    console.log(req.body)
    const User = await pool.query("SELECT * FROM USER WHERE username= ?",data.username);
        
    if(User.length==0){
        res.status(404).send("usuario no existe");
    }else{
        const compare = await bcrypt.compare(data.password,User[0].password);
        console.log(compare)
        if(compare){          
            const token = generateAccessToken(data.username);
            res.json(token);
        }else{
            res.status(404).send("contraseña erronea")
        }  
    }
})
router.get('/register',(req, res)=>{
    res.render("register",{title: "REGISTER",userNotCorrect:false,passNotMatch: false});
})
router.get('/userList',authenticateToken,async (req, res)=>{
    var User = await pool.query("SELECT id,username,permiss FROM USER");
    console.log(User.length)
    res.send({User});
    
});
router.use(user);
router.use(issue);
module.exports = router;