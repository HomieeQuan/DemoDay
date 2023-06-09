fetch('/chart')
    .then(response => response.json())
    .then(data => {
        // Process the retrieved data

        let earliestDate = new Date(data[0].date);
        let latestDate = new Date(data[0].date);

        for (let i = 0; i < data.length; i++) {
            const currentDate = new Date(data[i].date);
            if (currentDate < earliestDate) {
                earliestDate = currentDate;
            } else if (currentDate > latestDate) {
                latestDate = currentDate;
            }
        }

        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        let formattedEarlyDate = days[earliestDate.getDay()] + ' ' + months[earliestDate.getMonth()] + ' ' + earliestDate.getDate() + ' ' + earliestDate.getFullYear();
        let formattedLateDate = days[latestDate.getDay()] + ' ' + months[latestDate.getMonth()] + ' ' + latestDate.getDate() + ' ' + latestDate.getFullYear();
        const dateRange = `${formattedEarlyDate} - ${formattedLateDate}`;

        // Extract workout titles and reps from the data
        const workoutTitles = data.map(workout => workout.workoutTitle);
        const reps = data.map(workout => workout.reps);

        // Use the data in your JavaScript code as needed
        // For example, update the chart with the retrieved data

        const ctx = document.getElementById('myChart').getContext('2d');

        // Bar Chart
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: workoutTitles,
                datasets: [{
                    label: 'Reps',
                    data: reps,
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Workouts ${dateRange}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Doughnut Chart
        const doughnutCtx = document.getElementById('myDoughnutChart').getContext('2d');

        new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: workoutTitles,
                datasets: [{
                    label: 'Reps',
                    data: reps,
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Workouts ${dateRange}`
                    }
                }
            }
        });
    })
    .catch(error => {
        // Handle any errors that occurred during the fetch request
        console.log('Error:', error);
    });
