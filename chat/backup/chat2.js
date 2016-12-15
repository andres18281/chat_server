var express = require('express');
var app = express();
var http = require('http').Server(app);
var socket = require('socket.io')(http);
app.use('/', express.static(__dirname + '/'));

app.get('/', function(req, res){
 res.sendFile(__dirname + '/index.html');
});



var people = {};
console.log("prueba corriendo");
socket.on("connection", function (client){

    client.on("join", function(name){
          if(name.id != null){
            client.id = name.id;
            people[client.id] = {"id":client.id,"nombre":name.name};
          }else{
            console.log("id nuevo " +client.id);
            people[client.id] = {"id":client.id,"nombre":name.name};
          }

          client.emit("id_user",{"id":people[client.id].id,"nombre":name.name});
          console.log("cliente "+name.name);
          client.emit("update", "You have connected to the server.");
          socket.sockets.emit("update", name + " has joined the server.");
          socket.sockets.emit("update-people", people);
          console.log(name + "se ha unido con el id "+people[client.id].id);
          client.on("send", function(msg){
              socket.sockets.emit("chat", people[client.id], msg);
              console.log("usuario manda saludo"+msg);
          });
    });

    client.on("chat", function(msg){
      for(data in people){
        if(data == msg.id){
           client.to(msg.id).emit("chat",msg);
           //client.broadcast.emit("chat",msg);
        }
      }
      msg = {};
    });

    client.on("disconnect", function(){
      setTimeout(function () {
        // body...
        if (!people[client.id]) {
          socket.sockets.emit("update", people[client.id].name + " has left the server.");
          delete people[client.id];
          socket.sockets.emit("update-people", people);
        };
      }, 3000);
    });
});
http.listen(1223, function(){
 console.log('listening on *:1223');
});

