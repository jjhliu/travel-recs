//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const axios = require('axios');
const db = require(__dirname + "/data/database.js")

const app = express();
const homeStartingContent= "Planning your next adventure? Find out what your community has to recommend by viewing lists on Google Map. Contribute to this list by recommending new locations too!"
const aboutContent = "Getting travel recommmendations from your community of trusted circles has never been easier. Now simply browse or search for the cities you are planning to visit and click on the Google Maps Link to see what locations were recommended for that city. Use this website as a central directory for travel recommendations for various cities around the world. In addition, contribute your recommendations by sharing your Google Maps link for a new city so that your community can find your top recommendations too. Have a great trip!";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

let imageUrl = "";
let cityName = "";

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let postsArray = [];

app.get("/", function(req,res){

  db.query("SELECT * FROM posts",(error,response) =>{
    if (!error){
      // If query is successful, perform all actions here.
      console.log(response.rows);
      postsArray = response.rows;

      postsArray.sort((a,b)=>{
        let fa = a.city_name.toLowerCase(),
            fb = b.city_name.toLowerCase();
      
            if (fa<fb){
              return -1;
            }
            if (fa>fb){
              return 1;
            }
            return 0;
            });
      res.render("home", {startingContent: homeStartingContent, posts: postsArray, imageUrl: imageUrl, cityName: cityName});

    } else {
      console.log(error.message);
    }
  });

  res.render("home", {startingContent: homeStartingContent, posts: postsArray, imageUrl: imageUrl, cityName: cityName})

});


app.get("/about", function(req,res){
  res.render("about", {aboutPageContent: aboutContent});
});

app.get("/contact", function(req,res){
  res.render("contact", {contactPageContent: contactContent});
});

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.post('/compose', async function (req, res) {
  try {
      cityName = req.body.postTitle[0].toUpperCase()+ req.body.postTitle.substring(1);
      const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
      const apiUrl = `https://api.unsplash.com/photos/random?query=${cityName}&client_id=${UNSPLASH_ACCESS_KEY}`;

      const response = await axios.get(apiUrl);

      db.query({
        text:"INSERT INTO posts(city_name,travel_url,description,image_url) VALUES($1,$2,$3,$4)",
        values: [
          cityName,
          req.body.postBody,
          req.body.postDescription,
          response.data.urls.regular,
        ] } );
      res.redirect('/');

  } catch (error) {
      console.error('Error fetching image:', error.message);
  }
});


app.post("/search", function(req, res) {
  const searchTerm = _.lowerCase(req.body.searchCity);

  postsArray.forEach(function(post) {
    const storedTitle = _.lowerCase(post.city_name);
    if (storedTitle === searchTerm) {
      res.render("post",{
        title: post.city_name,
        content: post.travel_url,
        description: post.description,
        image:post.image_url,
      });
    }
    });
  });

  // else {
  //   res.status(404).send('City not found');}}

app.get("/posts/:query",function(req,res){
  const searchedTitle = _.lowerCase(req.params.query);
  
postsArray.forEach(function(post) {
  const storedTitle = _.lowerCase(post.city_name);
  if (storedTitle === searchedTitle) {
    res.render("post",{
      title: post.city_name,
      content: post.travel_url,
      description: post.description,
      image:post.image_url,
    });
  }
});
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port " + (process.env.PORT || 3000));
});
