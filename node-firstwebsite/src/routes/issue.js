const { query } = require('express');
const express = require('express');
const https = require('https');
const router = express.Router();
const {Octokit} = require('octokit');
const graph = require('graphql');

const octokit = new Octokit({
    // mi ordenador auth: "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"
    //ordenador empresa
    auth: "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"
})
// token
// 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
router.get('/issue', async(req,res)=>{
    const respuesta = await octokit.request('GET /repos/{owner}/{repo}/projects/{project_id}',{
        owner: 'SiriusBlack430',
        repo: 'pruebas_javascript',
        project_id: '1'
    })
    console.log(respuesta)
})
async function run(){
    try{
        const response = await octokit.request("GET /repos/{owner}/{repo}/projects",{
            
            owner: 'SiriusBlack430',
            repo: 'pruebas_javascript'   
            //project_id:1
        });
        
        console.log(response);
    }catch(e){
        console.log(e)
    } 

}
run()
module.exports = router;
curl --request POST --url https://api.github.com/repos/SiriusBlack430/pruebas_javascript --header "Authorization: token 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 " --data '{"query":"query{user(login: \"SiriusBlack430\") {projectNext(number: NUMBER){id}}}"}'


curl --request POST --url https://api.github.com/graphql --header 'Authorization: token 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' --data '{"query":"query{user(login: \"SiriusBlack430\") {projectNext(number: NUMBER){id}}}"}'