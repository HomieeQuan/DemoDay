Array.from(document.querySelectorAll('.btn')).forEach(function(element) {
    element.addEventListener('click', function(){
      fetch('/journal', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: element.getAttribute('id')
        })
      }).then(function (response) {
        window.location.reload();
      });
    });
  });
  