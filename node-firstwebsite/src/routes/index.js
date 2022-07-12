const express = require('express');
const router = express.Router();
const issue = require("./issue");
const pool = require("./conection");
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const secret = 'SECRET';
const saltRounds = 10;
pool.getConnection((err)=>{
    if(err){
        console.log(err);
        return;
    }
    console.log("DB connected");
})
function generateAccessToken(username){
    return jwt.sign(username,secret);
}
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401);
    try{
        const decodedUser = jwt.verify(token,secret)
        next()
    }catch(e){
        console.log("Token incorrecto")
    }
    
}
router.post('/log',async (req,res)=>{
    var data = req.body;
    console.log(req.body)
    const User = await pool.query("SELECT * FROM USER WHERE username= ?",data.username);
        
    if(User.length==0){
        res.status(404).send("usuario no existe");
    }else{
        const compare = await bcrypt.compare(data.password,User[0].password);
        if(compare){          
            const token = generateAccessToken(data.username);
            res.json(token);
        }else{
            res.status(404).send("contraseña erronea")
        }  
    }
})
router.post('/register', async (req, res)=>{
    var data = req.body;
    try{
        const User = await pool.query("SELECT * FROM USER WHERE username= ?",data.username);
        if(User.length !==0){
            res.status(404).send("Usuario ya existe");
        }else{
            const hashedPassword = await bcrypt.hash(data.password,saltRounds);
            const num = await pool.query("SELECT MAX(id) as id FROM USER");
            await pool.query("ALTER TABLE USER AUTO_INCREMENT = ?",num[0].id);
            await pool.query("INSERT INTO USER(username,password,permiss) VALUES(?,?,?)",[data.username,hashedPassword,"USER"],function(e,result){
                if(e){
                    res.status(404).send("Error al registrar");
                }
                
                res.status(200).send("Registrado correctamente");    
            });
        }
    }catch(e){
        res.status(404).send("Error");
    }  
})
router.get('/userList',authenticateToken,async (req, res)=>{
    var User = await pool.query("SELECT id,username,permiss FROM USER");

    res.send({User});
});

router.use(issue);
module.exports = router;