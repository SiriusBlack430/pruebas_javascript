const express = require('express');
const router = express.Router();
const user = require("./user");
const issue = require("./issue");
router.get('/', (req, res)=>{
    
    res.render('index', { title : "First Website"});
});
router.get('/log',(req, res)=>{
    req.session.destroy();

    res.render('log',{title : "LOGIN" , notCorrect: false})
    
})
router.get('/register',(req, res)=>{
    res.render("register",{title: "REGISTER",userNotCorrect:false,passNotMatch: false});
})

router.use(user);
router.use(issue);
module.exports = router;