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
                ... on Issue{
                  __typename
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
                  projectCards(first:10){
                    nodes{
                      column{
                        name
                      }
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

router.get("/projectv2",async(req,res)=>{
  await initializeData()
  const info = await fetch(baseUrl,{
    method: "POST",
    headers: headers,
    body: JSON.stringify(projectV2())
  })
  const infoJson = await info.json();
  console.log(infoJson)
  res.send(infoJson)
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
      console.log(items)
      
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
      res.render('issue')
    }
  }else{
    res.render('issue',{element,busqueda})
  }
});

router.get("/issue2",async(req,res)=>{
  var data = req.body
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
        var statusItem
        var titleIssue
        var urlIssue
        var labels
        for(var j=0; j<items[i].fieldValues.nodes.length; j++){
          for(var k=0; k<statusNames.length; k++){
            if(statusNames[k].name == items[i].fieldValues.nodes[j].name){
              statusItem = items[i].fieldValues.nodes[j].name
            }
          }
        }

        if(items[i].content.__typename==="Issue"){
          titleIssue = items[i].content.title
          urlIssue = items[i].content.bodyUrl
        }
        labels = items[i].content.labels

      }

    }catch(e){
      console.log(e.message)
    }
  }else{
  }
});

module.exports = router;