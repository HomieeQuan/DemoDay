const apiKey = 'AIzaSyCTRUf5UXqiekvUtWk8ZAoBM-uFB3SBnJc';

function searchTutorials() {
  var query = document.getElementById('searchInput').value;
  var url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&type=video&order=viewCount&q=${query}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Process the retrieved data
      console.log(data);
      if (data.items && data.items.length > 0) {
        var videoId = data.items[0].id.videoId;
        var videoUrl = `https://www.youtube.com/embed/${videoId}`;
        document.getElementById('videoFrame').src = videoUrl;
      }
    })
    .catch(error => {
      // Handle any errors
      console.error(error);
    });
}

document.getElementById('searchButton').addEventListener('click', searchTutorials); 