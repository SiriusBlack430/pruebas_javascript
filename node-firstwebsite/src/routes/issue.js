const express = require('express');
const { render } = require('express/lib/response');
const router = express.Router();
const fetch = require('node-fetch');
const pool = require("./conection");




var github_data ={};
const baseUrl = "https://api.github.com/graphql"; // url api
var headers = {};
async function initializeData(){
  //datos de config
  const data = await pool.query("SELECT * FROM REPCONFIG");
  headers = {
    "Content-Type":"application/json",
    Authorization: "bearer " + data[0].token,
  }
  //obtener id project a partir del nombre del proyecto
  const info = await fetch(baseUrl,{
    method: "POST",
    headers: headers,
    body: JSON.stringify(idProject(data[0].name))
  })
  var infoJson = await info.json();
  infoJson = infoJson.data.user.projectNext.id
  github_data = {
    "token": data[0].token,
    "username": data[0].name,
    "projectId": infoJson
  }
}
initializeData()
// query graphql
function idProject(username){
 return {
  "query":`
  query{
    user(login:"`+ username+`") {
      projectNext(number: 1) {
        id
        title
      }
    }
  }`,
};
}
function statusIssueOptions(){
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
        }
      }
    }`
  }
};

function statusId_value(){
  return {
    "query" : `query{
      node(id: "${github_data.projectId}") {
        ... on ProjectNext {
          items(first: 20) {
            edges {
              node {
                title
                fieldValues(first: 20) {
                  nodes {
                    projectField {
                      name
                    }
                    value
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
router.get("/configRepos",async(req,res)=>{
  var config = await pool.query("SELECT * from REPCONFIG");
  res.render("configRepos",{config:config[0]})
})
router.get("/issue",(req,res)=>{
  res.render("issue")
})
router.post("/issue",async (req,res)=>{
  var data = req.body;
  try{
    await pool.query("UPDATE REPCONFIG SET name= ? , token = ? , projectName = ?",[data.repository,data.token,data.projectName]);
  }catch(e){
    console.log(e);
  }
  res.render("issue")
})



router.get("/issueStatusOptions", async(req,res)=>{
  const info = await fetch(baseUrl,{
    method: "POST",
    headers: headers,
    body: JSON.stringify(statusIssueOptions())
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

  res.send(statusOptions);
});

router.get("/issueStatus" ,async(req,res)=>{
  const infoStat = await fetch(baseUrl,{
    method: "POST",
    headers: headers,
    body: JSON.stringify(statusIssueOptions())
  })
  const infoStatJson = await infoStat.json();
  var object = infoStatJson.data.node.fields.nodes;
  var statusOptions;
  for(var i=0;i<object.length;i++){
    if(object[i].name ==="Status"){
      statusOptions = JSON.parse(object[i].settings).options;
    }
  }
  for(var i=0;i<statusOptions.length;i++){
    delete statusOptions[i].name_html;
  }


  const info = await fetch(baseUrl,{
    method: "POST",
    headers: headers,
    body: JSON.stringify(statusId_value())
  })
  const infoJson = await info.json();
  var object = infoJson.data.node.items.edges;
  var element =[],cart={}
  for(var i=0;i<object.length;i++){
    for(var j=0;j<object[i].node.fieldValues.nodes.length;j++){
      if(object[i].node.fieldValues.nodes[j].projectField.name =="Status"){
        
        cart.title = object[i].node.title;
        for(var m=0;m<statusOptions.length;m++){
          if(statusOptions[m].id===object[i].node.fieldValues.nodes[j].value){
            cart.status = statusOptions[m].name;
          }
        }
        element.push({title: cart.title,status: cart.status});
        
        
      }
    }
    
    
  }
  res.send(element)


});
//   auth: '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' 


module.exports = router;
