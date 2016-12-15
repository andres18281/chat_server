var express = require('express');
var app = express();
var http = require('http').Server(app);
var socket = require('socket.io')(http);
var people = {};
socket.on("connection", function (client){
    client.on("join", function(name){
          if(name.id != null){ // si existe un id enviado por el cliente, no genera id
            var unique_id = name.id;
            client.id = unique_id.replace("/#","");
            people[client.id] = {"id":client.id,"nombre":name.name};
          }else{ // en caso de que no exisa el id, socket.io genera el id
            var unique_id = client.id;
            client.id = unique_id.replace("/#","");
            people[client.id] = {"id":client.id,"nombre":name.name};
          }
          client.emit("id_user",{"id":people[client.id].id,"nombre":name.name});
          socket.sockets.emit("update-people", people);
          console.log(people);
    });
    client.on("chat", function(msg){
      console.log(msg);
      for(data in people){
        console.log(data+" == "+msg.id);
        if(data == msg.id){
          socket.sockets.emit("chat", msg);
          // client.to(msg.id).emit("chat",msg);
        }
      }
      msg = {};
    });

    client.on("disconnect", function(){
      setTimeout(function () {
        if (!people[client.id]) {
          delete people[client.id];
          socket.sockets.emit("update-people", people);
        };
      }, 3000);
    });
});
http.listen(1223, function(){
 console.log('listening on *:1223');
});

