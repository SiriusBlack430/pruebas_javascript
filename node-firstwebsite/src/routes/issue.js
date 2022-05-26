const express = require('express');
const https = require('https');
const router = express.Router();
const {Octokit} = require('octokit');


const octokit = new Octokit({
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
    const data = await octokit.request("GET /repos/{owner}/{repo}/issues",{
        owner: 'SiriusBlack430',
        repo: 'pruebas_javascript',   
    });
    console.log(data);
}
run()
module.exports = router;