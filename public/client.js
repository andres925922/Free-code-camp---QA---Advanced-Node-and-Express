$(document).ready(function () {
  /** global io */
  const socket = io();

  socket.on('user', (data) => {
    // console.log(data);
    $('#num-users').text(data.currentUsers + ' users online');
    let message =
      data.username + (data.connected ? ' has joined the chat.' : ' has left the chat.');
    $('#messages').append($('<li>').html('<b>' + message + '</b>'));
  });

  /** 
   * In client.js, you should now listen for event 'chat message' and, when received, append a list item to #messages with the username, a colon, and the message!
   */
  socket.on('chat message', (data) => {
    $('#messages').append($('<li>').html('<b>' + data.message + '</b>'));
  });

  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();

    socket.emit('chat message', messageToSend);

    $('#m').val(''); // clear the text box
    return false; // prevent form submit from refreshing page
  });
});
