var socket = io();

socket.on('connect',function(data){
    socket.emit('john', 'Hello socket.io');
});

socket.on('thread',function(data){
    var li = document.getElementById('thread');
    li.append(`<li>${data}</li>`);
})

$('form').submit(function(e){
    e.preventDefault();
    console.log('abc')
})

