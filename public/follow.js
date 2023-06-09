
const accept = document.getElementsByClassName('acceptChat')
const decline = document.getElementsByClassName
('declineChat')



console.log('1', accept)
Array.from(accept).forEach(function(element) {
  element.addEventListener('click', function(){
    const chatReqId = this.parentNode.getAttribute('data-id')
    console.log('2', chatReqId)
    fetch('/acceptedChat', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chatReqId: chatReqId
      })
    })
    reloadPage()
    console.log('main complete')
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});


console.log('1', decline)
Array.from(decline).forEach(function(element) {
  element.addEventListener('click', function(){
    const chatReqId = this.parentNode.getAttribute('data-id')
    console.log('2', chatReqId)
    fetch('/declineChat', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chatReqId: chatReqId
      })
    })
    reloadPage();
    console.log('main complete')
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});
  
  function reloadPage(){
    window.location.reload()
  }



  Array.from(trash).forEach(function(element) {
    element.addEventListener('click', function(){

      fetch('declineRequest', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: element.id
        })
      }).then(function (response) {
        window.location.reload()
      })
    });
});