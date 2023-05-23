const user = require('./models/user');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const upload = multer({ storage: storage });


module.exports = function (app, passport, db) {
  const ObjectID = require('mongodb').ObjectID

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });


  app.get('/training', function (req, res) {
    res.render('training.ejs');
  });

  // app.get('/chartBar', function (req, res) {
  //   res.render('chart.ejs');
  // });

  // Intake route after signup this forwards us to the correct intake form
  app.get('/intake', isLoggedIn, function (req, res) {
    if (req.user.role === 'coach') {
      res.redirect('/intakeCoach')
    } else {
      res.redirect('/intakeAthlete')
    }

  });

  app.get('/chatHome/:coachId', isLoggedIn, function (req, res) {
    const athleteId = req.user._id.toString();
    const coachId = req.params.coachId;
  
    // Check if a chat request already exists for the user and coach
    db.collection('chatRequest').findOne({ athleteId, coachId }, (err, existingRequest) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (existingRequest) {
        // A chat request already exists, handle accordingly (e.g., show an error message)
        return res.send('You have already sent a chat request to this coach.');
      }
  
      // Create a new chat request
      db.collection('users').findOne({ _id: ObjectID(athleteId) }, (err, user) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Internal Server Error');
        }
  
        db.collection('chatRequest').insertOne({
          coachId,
          athleteId,
          chatRoomId: coachId,
          athleteName: user.firstName,
          athleteGoals: user.userIntake.goals,
          athleteSkill: user.userIntake.skill,
          athleteLevel: user.userIntake.level,
          athleteDate: user.userIntake.date
        }, (err) => {
          if (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
          }
  
          res.render('chatHome.ejs', {
            user: req.user,
            coachName: coachId
          });
        });
      });
    });
  });
  





  app.get('/chatroom', isLoggedIn, function (req, res) {
    //  need to delete the chat request when the coach goes to this route.
    // also need to send the chat request id from the form in coach.ejs as another hidden input, then use that id to delete that chat request freom mongodb
    // db.collection('users').find({ user: req.user._id  }).toArray((err, result) => {
    res.render('chatroom.ejs', {
      user: req.user,
      // role: result
    
      // coach
    })
  });


  //  intake route going to the intakeAthlete form
  app.get('/intakeAthlete', isLoggedIn, function (req, res) {
    res.render('intake.ejs', {
      user: req.user
    })

  });

  // Intake form for coach after signup

  app.get('/intakeCoach', isLoggedIn, function (req, res) {

    res.render('intakeCoach.ejs', {
      user: req.user
    })

  });


  // performance page after athlete submits log of workouts

  app.get('/performance', isLoggedIn, function (req, res) {
    db.collection('completedWorkouts').find({ user: req.user._id, workoutTitle: { $exists: true } }).toArray((err, result) => {
      /*TODO:
      1. Send titles, dates, reps to UI
      2. Display for each date the workouts completed and the reps completed
      3. Create a coach feedback section per day/ edit button only coach type accounts can see
      
      */
  
      console.log(result); // Log the result to see the retrieved data
  
      if (err) {
        console.log(err);
        return;
      }
      res.render('performance', {
        user: req.user,
        completedWorkouts: result // Pass the retrieved data to the EJS template
      });
    });
  });

  app.get('/performance', isLoggedIn, function (req, res) {
    db.collection('completedWorkouts').find({ user: req.user._id, workoutTitle: { $exists: true } }).toArray((err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      
      const completedWorkoutsWithImages = result.map(workout => {
        const imageURL = cloudinary.url(workout.image, { width: 200, height: 200, crop: 'fill' });
        return { ...workout, imageURL };
      });
      console.log('completedWorkouts', completedWorkoutsWithImages)
      
      res.render('performance', {
        user: req.user,
        completedWorkouts: completedWorkoutsWithImages
      });
    });
  });

  app.get('/performanceCoach', isLoggedIn, async function (req, res) {
    const chatRequests = await db.collection('chatRequest').find({coachId: req.user._id.toString()}).toArray()

    const athletes = chatRequests.map(cr => ObjectID(cr.athleteId))
    console.log('chat', chatRequests)
    console.log('athletes', athletes)
    
    const completedWorkouts = await db.collection('completedWorkouts').find({ user: { $in: athletes } }).toArray()
    console.log(completedWorkouts)
    res.render('performanceCoach', {
      user: req.user,
      completedWorkouts: completedWorkouts
    });
  });

  

  // app.get('/chart', function (req, res) {
  //   // Retrieve data from MongoDB
  //   db.collection('completedWorkouts').find().toArray((err, data) => {
  //     if (err) {
  //       console.log(err);
  //       res.status(500).json({ error: 'Internal server error' });
  //       return;
  //     }
  
  //     res.json(data);
  //   });
  // });
  
  
  
  
  

  // Rest of the code...




  // PROFILE SECTION =========================

  app.get('/profile', isLoggedIn, function (req, res) {
    if (req.user.role === 'coach') {
      res.redirect('/coachPage');
      return
    }
    const userObj = req.user.toObject()

    db.collection('workout').find({ level: userObj.userIntake.level, skill: userObj.userIntake.skill }).toArray((err, result) => {

      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        workout: result
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================
  app.post('/completedWorkouts', upload.array('files'), async function (req, res) {

    console.log('files', req.files)
    console.log('body', req.body)

    const keys = Object.keys(req.body); // Get an array of all keys in the object
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      const splitKey = key.split(':')
      console.log("checking", splitKey)
      if (req.body[key] && splitKey[0] === "completed") {
        const workoutId = splitKey[1]
        const workoutTitleKey = `title:${workoutId}`
        const workoutTitle = req.body[workoutTitleKey]
        const fileNameKey = `fileName:${workoutId}`
        let originalName = req.body[fileNameKey];
        const fileNameParts = originalName.split("\\");

        originalName = fileNameParts[fileNameParts.length - 1]
        console.log(originalName)
        const file = req.files.find(f => f.originalname === originalName)
        console.log(file);
        const currentDate = new Date().toDateString()
        console.log("insert/update:", workoutId, workoutTitle, file.path, currentDate);
        let cresult;
        try{
          cresult = await cloudinary.uploader.upload(file.path);
          console.log('see result', cresult)
        } catch (err) {
          console.log("cloudinary error", err)
        }
        // await db.collection('completedWorkouts').deleteMany();
        await db.collection('completedWorkouts').updateOne({date: {$gte: currentDate}, workout: splitKey[1] }, 
          {$set :{
            user: req.user._id,
            workoutID: workoutId,
            workoutTitle: workoutTitle,
            reps: req.body[key],
            date: currentDate,
            url: cresult?.secure_url
          }}, 
          {upsert: true})
      }
    }
    
    res.redirect('/performance')

  });

  app.post('/completedWorkouts', upload.array('files'), (req, res) => {
    // Access the uploaded files using req.files
    // Handle file upload logic here
  
    // Access the submitted form data using req.body
    // Handle the submitted form data
  
    res.send('Workout submitted successfully');
  });


  app.post('/addcomment', isLoggedIn, function (req, res) {
    const workoutId = req.body.workoutId;
    const coachComment = req.body.coachComment;
    const coachName = req.user.firstName; // Retrieve the coach name from the session or request object
  
    // Update the workout document with the coach comment and name
    db.collection('completedWorkouts').updateOne(
      { _id: ObjectID(workoutId) },
      { $set: { coachComment: coachComment, coachName: coachName } }, // Include the coach name in the update operation
      function (err, result) {
        if (err) {
          console.log(err);
          return res.status(500).send('Internal Server Error');
        }
        res.redirect('/performanceCoach');
      }
    );
  });
  

  app.post('/follow', isLoggedIn, function (req, res) {
    const athleteUsername = req.body.username;
  
    // Retrieve the athlete's role, firstName, and lastName from the 'users' collection
    db.collection('users')
      .findOne({ username: athleteUsername, role: 'athlete' })
      .then(function (athlete) {
        if (!athlete) {
          throw new Error('Athlete not found.');
        }
  
        const { role, firstName, lastName } = athlete;
  
        // Save the athlete's role, firstName, and lastName in the 'follow' collection
        return db.collection('follow').insertOne({
          role: role,
          firstName: firstName,
          lastName: lastName
        });
      })
      .then(function (result) {
        console.log('Successfully followed athlete:', result.ops[0]);
        res.sendStatus(200);
      })
      .catch(function (error) {
        console.log(error);
        res.sendStatus(500);
      });
  });
  
  

  app.post('/improve', (req, res) => {
    // console.log(req.body);
    // console.log('this logged in user ', req.user);
    const currentDate = new Date().toDateString()
    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(req.user._id) },
      {
        $set: {
          userIntake: {
            level: req.body.level,
            skill: req.body.skill,
            workWithCoach: req.body.workWithCoach,
            goals: req.body.goals,
            date: currentDate
          }
        }
      },
      (err, result) => {
        if (err) {
          console.log(err);
          return res.redirect('/profile');
        }

        // Retrieve updated user data
        db.collection('users').findOne({ _id: ObjectID(req.user._id) }, (err, updatedUser) => {
          if (err) {
            console.log(err);
            return res.redirect('/profile');
          }

          console.log(updatedUser);

          // Check if the user wants to work with a coach
          if (updatedUser.userIntake.workWithCoach === 'yes') {
            return res.redirect('/coachList');
          }

          res.redirect('/profile');
        });
      }
    );
  });



  app.post('/intakeCoach', (req, res) => {
    // console.log(req.body);
    // console.log('this logged in user ', req.user);

    db.collection('users').findOneAndUpdate(
      { _id: ObjectID(req.user._id) },
      {
        $set: {
          coachIntake: {
            coachingExperience: req.body.coachingExperience,
            skills: req.body.skills,
            college: req.body.college,
            professional: req.body.professional == 'on',
            previousExperience: req.body.previousExperience
          }
        }
      },
      (err, result) => {
        if (err) {
          console.log(err);
          return res.redirect('/profile');
        }

        // Retrieve updated user data
        db.collection('users').findOne({ _id: ObjectID(req.user._id) }, (err, updatedUser) => {
          if (err) {
            console.log(err);
            return res.redirect('/profile');
          }

          // console.log(updatedUser);



          res.redirect('/profile');
        });
      }
    );
  });

  // db.collection('workout').find({level: req.body.level, skill: req.body.skill}).toArray((err, result) => {
  //   if (err) return console.log(err)
  //   res.render('profile.ejs', {
  //     user : req.user,
  //     workout: result
  //   })
  // })

  app.get('/coachList', function (req, res) {
    db.collection('users').find().toArray((err, users) => {
      console.log({ users })
      const coaches = users.filter((user) => user.role === 'coach')
      if (err) return console.log(err);
      res.render('coachList.ejs', { coaches });
    });
  });


  app.get('/coachPage', isLoggedIn, function (req, res) {
    db.collection('chatRequest').find().toArray((err, chatRequests) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      }
      console.log('before filter', chatRequests)

      const incomingChatRequests = chatRequests.filter((chatRequest) => chatRequest.coachId === req.user._id.toString());
      console.log('after filter', incomingChatRequests)
      res.render('coach.ejs', { incomingChatRequests, user: req.user });
    });
  });




  app.delete('/coach', (req, res) => {
    db.collection('chatRequest').findOneAndDelete({ _id: ObjectID(req.body.id) }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/intake', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
