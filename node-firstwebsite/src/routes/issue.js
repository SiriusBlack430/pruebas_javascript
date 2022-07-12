const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require("./conection");

var github_data ={}, headers = {},element=[],cart={}, busqueda="";
const baseUrl = "https://api.github.com/graphql"; // url api
// query graphql
// username SiriusBlack430
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

//id project  PN_kwHOBQI_A84ACKFd

function projectV2(user,project){
  return{
    "query":`
    query{
      user(login:"`+user+`"){
        projectV2(number:`+project+`){
          fields(first:20){
            nodes{
              ... on ProjectV2SingleSelectField{
                name
                options{
                  name
                }
              }
            }
          }
          items(first:20){
            nodes{
              fieldValues(first: 8) {
                nodes{
                  ... on ProjectV2ItemFieldSingleSelectValue{
                    name
                  }
                }
              }
              content{
                  __typename
                  ... on Issue{
                  title
                  labels(first:20){
                    nodes{
                      name
                    }
                  }
                  bodyUrl
                  comments{
                   totalCount
                  }
                  assignees(first:20){
                    nodes{
                      login
                    }
                  }
                  participants(first:20){
                    nodes{
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`,
  };
}
async function initializeData(){
  //datos de config
  const data = await pool.query("SELECT * FROM REPCONFIG");
  if(data.length===0){
    return;
  }
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
    console.log(e.message) 
  }
  
}

router.post("/configRepos",async (req,res)=>{
  var data = req.body;
  try{
    await pool.query("INSERT INTO REPCONFIG(name,token,project) VALUES(?,?,?)",[data.user,data.token,data.project]);
    headers = {
      "Content-Type":"application/json",
      Authorization: "bearer "+data.token
    } 
    const info = await fetch(baseUrl,{
      method: "POST",
      headers: headers,
      body: JSON.stringify(projectV2(data.user,data.project))
    })
    const infoJson = await info.json();
    var fields = infoJson.data.user.projectV2.fields.nodes;
    var statusNames;
    for(var i=0;i<fields.length;i++){
      if(fields[i].name === "Status"){
        statusNames = fields[i].options
      }
    }
    console.log(statusNames)
    res.send(statusNames)

  }catch(e){
    console.log(e);
    res.sendStatus(404);
  }
  
})

//ghp_nUxhCggtwoD0um      +   rdPTyVLGsDNI8dza3AOu3B
router.get("/issue",async(req,res)=>{
  if(github_data.projectId === undefined || github_data.token === undefined || github_data.username === undefined ){
    await initializeData();
  }

  if(element.length==0){
    try{
      const info = await fetch(baseUrl,{
        method: "POST",
        headers: headers,
        body: JSON.stringify(projectV2())
      })
      const infoJson = await info.json();
      var fields = infoJson.data.user.projectV2.fields.nodes;
      var statusNames;
      for(var i=0;i<fields.length;i++){
        if(fields[i].name === "Status"){
          statusNames = fields[i].options
        }
      }
      var items = infoJson.data.user.projectV2.items.nodes;
      for(var i=0; i<items.length; i++){
        for(var j=0; j<items[i].fieldValues.nodes.length; j++){
          for(var k=0; k<statusNames.length; k++){
            if(statusNames[k].name === items[i].fieldValues.nodes[j].name){
              cart.status = items[i].fieldValues.nodes[j].name
            }
          }
        }
        cart.label=""
        if(items[i].content.__typename==="Issue"){
          cart.title = items[i].content.title
          cart.url = items[i].content.bodyUrl
          for(var l=0; l<items[i].content.labels.nodes.length; l++){
              cart.label = items[i].content.labels.nodes[l].name+" "+cart.label
          }
        }
        element.push({title: cart.title,status: cart.status,url: cart.url,label: cart.label});
      }
      res.render("issue",{element,busqueda})
    }catch(e){
      console.log(e.message)
      res.render('issue')
    }
  }else{
    res.render('issue',{element,busqueda})
  }
})

router.post("/issue",async (req,res)=>{
  busqueda = req.body.filtroStatus;
  res.render('issue',{busqueda,element})
})

module.exports = router;