var thumbUp = document.getElementsByClassName("fa-thumbs-up");
var trash = document.getElementsByClassName("fa-trash");
var thumbDown = document.getElementsByClassName("fa-thumbs-down");

Array.from(thumbUp).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
        fetch('thumbup', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'name': name,
            'msg': msg,
            'thumbUp':thumbUp
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(thumbDown).forEach(function(element) {
  element.addEventListener('click', function(){
    const name = this.parentNode.parentNode.childNodes[1].innerText
    const msg = this.parentNode.parentNode.childNodes[3].innerText
    const thumbDown = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
    fetch('thumbdown', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'name': name,
        'msg': msg,
        'thumbUp':thumbDown
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
 
        fetch('coach', {
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



// fetch('/chart')
//   .then(response => response.json())
//   .then(data => {
//     // Process the retrieved data
//     console.log();

//     // Extract workout titles and reps from the data
//     const workoutTitles = data.map(workout => workout.workoutTitle);
//     const reps = data.map(workout => workout.reps);

//     // Use the data in your JavaScript code as needed
//     // For example, update the chart with the retrieved data
//     const ctx = document.getElementById('myChart').getContext('2d');

//     console.log(reps)
//     new Chart(ctx, {
//       type: 'bar',
//       data: {
//         labels: workoutTitles,
//         datasets: [{
//           label: 'Reps',
//           data: reps,
//           borderWidth: 1
//         }]
//       },
//       options: {
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         }
//       }
//     });
//   })
//   .catch(error => {
//     // Handle any errors that occurred during the fetch request
//     console.log('Error:', error);
//   });




