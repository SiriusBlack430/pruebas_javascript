const express = require('express');
const router = express.Router();

router.get('/', (req,res)=>{
    //res.sendFile(path.join(__dirname,'pages/index.html'));
    res.render('index', { title : "First Website"});
});
router.get('/contact', (req,res)=>{
    //res.sendFile(path.join(__dirname,'pages/index.html'));
    
    res.render('contact', { title : "Contact pages"});
});
router.get('/login', (req, res)=>{
    res.render('login', { title: "Login"});
});
router.post('/login', (req, res)=>{
    var data = req.body;
    if(data.password === 'password'){
        res.render('login',{ title: "Login correcto"});
    }else{
        res.render('login',{ title: "Login inccorrecto"});
    }
    
})
module.exports = router;