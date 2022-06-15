const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require("./conection");

var auth = function(req, res, next) {
  console.log("Session"+ JSON.stringify(req.session))
  if (req.session && req.session.permiss){
      
     return next();
      
  }else{
      return res.sendStatus(401);
  }
};
var busqueda="";
var github_data ={}, headers = {},element=[],cart={};
const baseUrl = "https://api.github.com/graphql"; // url api

async function initializeData(){
  //datos de config
  const data = await pool.query("SELECT * FROM REPCONFIG");
  var auth = "bearer " + data[0].token;
  headers = {
    "Content-Type":"application/json",
    Authorization: auth
  }
  //obtener id project a partir del nombre del proyecto
  try{
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
    console.log("Configuracion incorrecta")
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
          items(first: 20) {
            nodes {
              fieldValues(first: 8) {
                nodes {
                  value
                  projectField {
                    name
                  }
                }
              }
              content {
                __typename
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
    await pool.query("UPDATE REPCONFIG SET name= ? , token = ? , projectName = ?",[data.repository,data.token,data.projectName]);
  }catch(e){
    console.log(e);
  }
  await initializeData()
  res.redirect("issue")
  
})


router.get("/issue",auth,async(req,res)=>{

  if(element.length==0){
    try{
      const info = await fetch(baseUrl,{
        method: "POST",
        headers: headers,
        body: JSON.stringify(nameStatusLabelUrl())
      })
      const infoJson = await info.json();
      var fields = infoJson.data.node.fields.nodes;
      var statusOptions;
      for(var i=0;i<fields.length;i++){
        if(fields[i].name ==="Status"){
          statusOptions = JSON.parse(fields[i].settings).options;
        }
      }
      for(var i=0;i<statusOptions.length;i++){
        delete statusOptions[i].name_html;
      }
      var items = infoJson.data.node.items.nodes;
  
      for(var i=0;i<items.length;i++){
        
        for(var j=0;j<items[i].fieldValues.nodes.length;j++){
          
            if(items[i].fieldValues.nodes[j].projectField.name ==="Status" && items[i].content.__typename ==="Issue"){
              cart.label = "";
              cart.title = items[i].content.title;
              cart.url = items[i].content.bodyUrl;
              for(var o =0;o<items[i].content.labels.nodes.length;o++){
                cart.label = cart.label +" "+ items[i].content.labels.nodes[o].name;
              }
              
              for(var m=0;m<statusOptions.length;m++){
                if(statusOptions[m].id==items[i].fieldValues.nodes[j].value){
                  cart.status = statusOptions[m].name;
                }
              }  
            element.push({title: cart.title,status: cart.status,url: cart.url,label: cart.label});
          } 
        }
      }
        
      res.render("issue",{element,busqueda})
    }catch(e){
      console.log(e.message)
      res.render('issue',{element:{},busqueda})
    }
  }else{
    res.render('issue',{element,busqueda})
  }
  var config = await pool.query("SELECT * from REPCONFIG");
  res.render('issue',{config:config[0]})
});

router.post("/issue",async (req,res)=>{
  busqueda = req.body.filtroStatus;
  res.render('issue',{busqueda,element})
})
module.exports = router;