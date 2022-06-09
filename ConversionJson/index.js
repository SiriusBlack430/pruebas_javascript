const fs = require('fs');
const archiver = require('archiver');
const base64 = require('file-base64');
const dataQuery = require("./fake_data_AddNextGen");
const fetch = require('node-fetch');

const headers = {
    Authorization: '85BFE18B-8D28-492F-806D-B834C2BF7265',
    'Content-Type' :'application/json;charset=UTF-8',
    'Accept-Charset' : 'utf-8'
    }
const baseUrl = "https://cdawssrv-pre.azurewebsites.net/api2/CDA/AddNextGen";

const clientes = Object.getOwnPropertyNames(dataQuery);
var allData =[];
var data= {};
var dat;

for(let i in clientes){
    for(let j in dataQuery[clientes[i]]){
        data.ClientCode = "Undefined";
        if(dataQuery[clientes[i]][j].flavor === "MiniGT"){
            data.idMochila = "GT 1";
        }else if(dataQuery[clientes[i]][j].flavor === "BoldGT"){
            data.idMochila = "GT 2";
        }
        data.UserName = dataQuery[clientes[i]][j].username;
        var fecha = dataQuery[clientes[i]][j].ts.substring(0,10);
        fecha = fecha.replace(/^(\d{4})-(\d{2})-(\d{2})$/g,'$3/$2/$1') + dataQuery[clientes[i]][j].ts.substring(10,dataQuery[clientes[i]][j].ts.length-4) ;
        data.IdCda = "Undefined";
        data.TimeStamp = fecha;
        data.Operation = "AddUser";
        allData.push(data)
        data ={};
    }  
}
dat = JSON.stringify(allData)
function zipAndSend(){
    archiver.registerFormat('zip-encryptable', require('archiver-zip-encryptable'));
    var output = fs.createWriteStream(__dirname + '/Data.zip');
    var archive = archiver('zip-encryptable', {
        zlib: { level: 8 },
        encryptionMethod: 'aes256',
        password: '1I#&nn*2G9xQ'
    });
    archive.on('finish',async()=>{
        await base64.encode('Data.zip',async(err,output)=>{
            if(err){
                console.log("ERROR!!!!!")
                return
            }
            const info = await fetch(baseUrl,{
                method: "POST",
                headers: headers,
                body: JSON.stringify(output)
            })
            var data = await info.json();
            console.log(data);
        })
    })
    archive.pipe(output);
    archive.append(dat, { name: 'data.json' });
    archive.finalize();
  
}

zipAndSend()







