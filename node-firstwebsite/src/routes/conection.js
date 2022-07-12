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
    permiss VARCHAR(20),
    sessionid int(3),
    constraint fk_session
    foreign key (sessionid)
        references SESSION(id)

);
INSERT INTO USER(username,password,permiss) 
VALUES("amy","$2b$10$B3aozsB.Dw1gFitnm8k3EulfBXrGikAxFMVrYJxHFHR6CjbZanZ0a","ADMIN");

DROP TABLE IF EXISTS REPCONFIG;
CREATE TABLE REPCONFIG(
    id int(10) primary key auto_increment,
    name VARCHAR(50),
    token VARCHAR(200),
    project int(2)
);

DROP TABLE IF EXISTS SESSION;
CREATE TABLE SESSION(
    id int(3) primary key auto_increment,
    name VARCHAR(50),
    creation_time DATE,
    configid int(10),
    constraint fk_config
    foreign key (configid)
        references REPCONFIG(id)
);

DROP TABLE IF EXISTS ISSUE;
CREATE TABLE ISSUE(
    id int(4) primary key,

);

*/





 //amy password =  $2b$10$B3aozsB.Dw1gFitnm8k3EulfBXrGikAxFMVrYJxHFHR6CjbZanZ0a