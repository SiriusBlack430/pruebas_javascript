const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require("./conection");

var github_data ={}, headers = {};;
const baseUrl = "https://api.github.com/graphql"; // url api

var auth = function(req, res, next) {
  console.log("Session"+ JSON.stringify(req.session))
  if (req.session && req.session.permiss){
      
     return next();
      
  }else{
      return res.sendStatus(401);
  }
};

async function initializeData(){  
  try{
    //datos de config
    const data = await pool.query("SELECT * FROM REPCONFIG");
    var auth = "bearer " + data[0].token;
    headers = {
      "Content-Type":"application/json",
      Authorization: auth
    }
    //obtener id project a partir del nombre del proyecto
    const info = await fetch(baseUrl,{
      method: "POST",
      headers: headers,
      body: JSON.stringify(idProject(data[0].name))
    })
    var infoJson = await info.json();
    infoJson = infoJson.data.user.projectsNext.nodes;
    var projectId;
    for(let i in infoJson){
      if(infoJson[i].title == data[0].projectName){
        projectId = infoJson[i].id;
      }
    }
    github_data = {
      "token": data[0].token,
      "username": data[0].name,
      "projectId": projectId
    }
  }catch(e){
    github_data = {}
    console.log("Configuracion repo incorrecta")
  }
}
// query graphql
//id project  PN_kwHOBQI_A84ACKFd
function idProject(username){
 return {
  "query":`
  query{
    user(login:"`+ username+`") {
      projectsNext(first:20) {
        nodes{
          id
          title
        }    
      }
    }
  }`,
};
}
function nameStatusLabelUrl(){
  return {"query":`
    query{
      node(id: "${github_data.projectId}") {
        ... on ProjectNext {
          fields(first: 20) {
            nodes {
              id
              name
              settings
            }
          }
          items(first: 100) {
            nodes {
              fieldValues(first: 100) {
                nodes {
                  value
                  projectField {
                    name
                  }
                }
              }
              content {
                ... on Issue {
                  title
                  labels(first: 5) {
                    nodes {
                      name
                    }
                  }
                  bodyUrl
                }
              }
            }
          }
        }
      }
    }`
  }
};



router.get("/configRepos",auth,async(req,res)=>{
  var config = await pool.query("SELECT * from REPCONFIG");
  res.render("configRepos",{config:config[0]})
})
router.post("/configRepos",async (req,res)=>{
  var data = req.body;
  try{
    var config = await pool.query("SELECT * from REPCONFIG");
    if(config.length==0){
      await pool.query("INSERT INTO REPCONFIG VALUES(?,?,?)",[data.repository,data.token,data.projectName]);
    }else{
      await pool.query("UPDATE REPCONFIG SET name= ? , token = ? , projectName = ?",[data.repository,data.token,data.projectName]);
    }
  }catch(e){
    console.log(e);
  }
  res.redirect("issue")
  
})
router.get("/issue",auth,async(req,res)=>{
  try{
    await initializeData()
    if(github_data.projectId===undefined){
      console.log("conexionfailed")
    }
    res.render("issue",{element:{}})
  }catch(e){
    console.log("Conexion fallida")
  }
  
  
})
/* router.get("/issue",auth,async(req,res)=>{
  
   var element =[],cart={}
  try{
    awaitinitializeData()
    const info = await fetch(baseUrl,{
      method: "POST",
      headers: headers,
      body: JSON.stringify(nameStatusLabelUrl())
    })
    const infoJson = await info.json();
    var object = infoJson.data.node.fields.nodes;
    var statusOptions;
    for(var i=0;i<object.length;i++){
      if(object[i].name ==="Status"){
        statusOptions = JSON.parse(object[i].settings).options;
      }
    }
    for(var i=0;i<statusOptions.length;i++){
      delete statusOptions[i].name_html;
    }
    object = infoJson.data.node.items.nodes;
    for(var i=0;i<object.length;i++){
      for(var j=0;j<object[i].fieldValues.nodes.length;j++){
        if(object[i].fieldValues.nodes[j].projectField.name =="Status"){
          cart.label = "";
          cart.title = object[i].content.title;
          cart.url = object[i].content.bodyUrl;
          for(var o =0;o<object[i].content.labels.nodes.length;o++){
            cart.label = cart.label +" "+ object[i].content.labels.nodes[o].name
          }

          for(var m=0;m<statusOptions.length;m++){
            if(statusOptions[m].id===object[i].fieldValues.nodes[j].value){
              cart.status = statusOptions[m].name;
              
            }
          }
          element.push({title: cart.title,status: cart.status,url: cart.url,label: cart.label});
        }
      }
    }
    res.render("issue",{element})
  }catch(e){
    res.render("issue",{element: {}})
  } 
  
}); */
//   auth: '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' 
module.exports = router;
