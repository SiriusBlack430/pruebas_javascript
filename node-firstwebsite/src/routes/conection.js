const mysql = require('mysql'); // modulo para bbdd mysql
const {promisify} = require('util');

const pool = mysql.createPool({
    host: 'localhost',
    user : 'NormalUser',
    password: 'NormalUser',
    database: 'prueba'
})
pool.query = promisify(pool.query);

module.exports = pool;
/*
CREATE DATABASE prueba;
use prueba;

DROP TABLE IF EXISTS USER;
CREATE TABLE USER(
    id int(10) primary key auto_increment,
    username VARCHAR(50),
    password VARCHAR(200),
    permiss VARCHAR(20)
);
INSERT INTO USER(username,password,permiss) 
VALUES("amy","$2b$10$B3aozsB.Dw1gFitnm8k3EulfBXrGikAxFMVrYJxHFHR6CjbZanZ0a","ADMIN");

DROP TABLE IF EXISTS REPCONFIG;
CREATE TABLE REPCONFIG(
    name VARCHAR(50) primary key,
    token VARCHAR(200),
    projectName VARCHAR(50)
);
INSERT INTO REPCONFIG VALUES("SiriusBlack430","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","Prueba_issue")

*/


 //amy password =  $2b$10$B3aozsB.Dw1gFitnm8k3EulfBXrGikAxFMVrYJxHFHR6CjbZanZ0a