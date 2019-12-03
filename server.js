var express = require("express");
var path = require('path');
var app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
let clients = 0;

app.get('/', function(req, res){
	res.render('index.ejs');
});

io.on('connection', function (socket) {


    socket.on('ready', (room, callback) => {
        socket.join(room);
        socket.broadcast.to(room).emit('announce', {
            message: 'New client in the ' + room + ' room.'
        });
        callback('');
    });

    socket.on('send', (req, callback) => {
        io.to(req.room).emit('message', {
            message: req.message,
            author: req.author
        });
    });


    socket.on("NewClient", function () {
        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreatePeer')
            }
        }else{
            this.emit('SessionActive')
        }
        clients++;
    })
    socket.on('Offer', SendOffer);
    socket.on('Answer', SendAnswer);
    socket.on('disconnect', Disconnect);
});

function Disconnect() {
    if (clients > 0) {
        if (clients <= 2)
            this.broadcast.emit("Disconnect")
        clients--
    }
}

function SendOffer(offer) {
    this.broadcast.emit("BackOffer", offer)
}

function SendAnswer(data) {
    this.broadcast.emit("BackAnswer", data)
}


function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
}
var port = normalizePort(process.env.PORT || 3000);
http.listen(port, () => console.log(`Active on ${port} port`))