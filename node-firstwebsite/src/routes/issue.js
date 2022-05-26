const express = require('express');
const router = express.Router();
router.get('/issue',(req,res)=>{
    res.render('issue');
})
module.exports = router;