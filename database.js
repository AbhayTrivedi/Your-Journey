const mysql = require("mysql2");
const { DateTime } = require('luxon');
const mysqlConfig = require('./config/mysql_config.json');


// DEPRICATED
exports.addUser = async (email, password) => {
   const pool = mysql.createPool(mysqlConfig).promise();
   await pool.query(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, password]);

   const userID = await pool.query(`SELECT userId FROM users WHERE email = ?`, [email]);

   pool.end();
   return userID[0][0]["userId"];
};


exports.checkAddGoogleUser = async (email) => {
   const pool = mysql.createPool(mysqlConfig).promise();
   const result = await pool.query(`SELECT * FROM users WHERE email LIKE ?`, [email]);
   const myuser = result[0];

   if (myuser.length === 0) {
      await pool.query(`INSERT INTO users (email) VALUES (?)`, [email]);
   }
   pool.end();
};


// DEPRICATED
exports.checkUser = async (email, password) => {
   const pool = mysql.createPool(mysqlConfig).promise();
   const result = await pool.query(`SELECT * FROM users WHERE email LIKE ? AND password LIKE ?`, [email, password]);

   const user = result[0];

   pool.end();
   return user;
};


exports.importChats = async (email, chatNum) => {
   const pool = mysql.createPool(mysqlConfig).promise();
   const result = await pool.query(`SELECT ${chatNum} FROM users WHERE email LIKE ?`, [email]);

   const chats = result[0][0][chatNum];

   pool.end();
   return chats;
};


exports.getAllChats = async (email) => {
   const pool = mysql.createPool(mysqlConfig).promise();
   const result = await pool.query(`SELECT chat1, chat2, chat3, chat4, chat5 FROM users WHERE email = ?`, [email]);

   const chats = result[0][0];

   pool.end();
   return chats;
};


exports.storeQuery = async (email, userInput, response, chatNum) => {
   const pool = mysql.createPool(mysqlConfig).promise();
   const now = DateTime.now();
   const time = now.toFormat('hh:mm a');
   const date = now.toFormat('MMM dd');

   const result = await pool.query(`SELECT ${chatNum} FROM users WHERE email LIKE ?`, [email]);

   let userChats = result[0][0][chatNum];

   userChats["chats"].push([userInput, response, time, date]);

   if (userChats["welcome"].length === 0) {
      userChats["welcome"].push(time);
      userChats["welcome"].push(date);
   }

   userChats = JSON.stringify(userChats);

   await pool.query(`UPDATE users SET ${chatNum} = ? WHERE email = ?`, [userChats, email]);
   pool.end();
};


exports.addChat = async (email) => {
   const pool = mysql.createPool(mysqlConfig).promise();
   const result = await pool.query(`SELECT chat1, chat2, chat3, chat4, chat5 FROM users WHERE email = ?`, [email]);

   const chats = result[0][0];

   const chat0 = JSON.stringify({ chats: [], welcome: [] });
   const chat1 = JSON.stringify(chats.chat1);
   const chat2 = JSON.stringify(chats.chat2);
   const chat3 = JSON.stringify(chats.chat3);
   const chat4 = JSON.stringify(chats.chat4);


   await pool.query(`UPDATE users SET chat1 = ?, chat2 = ?, chat3 = ?, chat4 = ?, chat5 = ? WHERE email = ?`,
      [chat0, chat1, chat2, chat3, chat4, email]);

   pool.end();
   return "Added"
};

