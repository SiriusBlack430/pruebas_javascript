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
/*Create table USER(
    id int(10) primary key auto_increment,
    username VARCHAR(50),
    password VARCHAR(200),
    permiss VARCHAR(20)
)*/

 //amy password =  $2b$10$B3aozsB.Dw1gFitnm8k3EulfBXrGikAxFMVrYJxHFHR6CjbZanZ0a