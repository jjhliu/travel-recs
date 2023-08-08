//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const axios = require('axios');
// const db = require ('/data/database');

const homeStartingContent= "Planning your next adventure? Find out what your community has to recommend by viewing lists on Google Map. Contribute to this list by recommending new locations too!"
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

const UNSPLASH_ACCESS_KEY = 'QvGl79G0m-V4qD5BIl3BMxJyI2aCvxvSBMtty9e829U';
let imageUrl = "";
let cityName = "";

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


let postsArray = [];


app.get("/", function(req,res){
  postsArray.sort((a,b)=>{
    let fa = a.title.toLowerCase(),
        fb = b.title.toLowerCase();
  
        if (fa<fb){
          return -1;
        }
        if (fa>fb){
          return 1;
        }
        return 0;
        });
  res.render("home", {startingContent: homeStartingContent, posts: postsArray, imageUrl: imageUrl, cityName: cityName});
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
      cityName = req.body.postTitle;
      const apiUrl = `https://api.unsplash.com/photos/random?query=${cityName}&client_id=${UNSPLASH_ACCESS_KEY}`;

      const response = await axios.get(apiUrl);

      const post = {
        title:req.body.postTitle,
        content:req.body.postBody,
        description:req.body.postDescription,
        imageUrl: response.data.urls.regular,
      };
    
      postsArray.push(post);
      res.redirect('/');

  } catch (error) {
      console.error('Error fetching image:', error.message);
  }
});


app.post("/search", function(req, res) {
  const searchTerm = _.lowerCase(req.body.searchCity);

  postsArray.forEach(function(post) {
    const storedTitle = _.lowerCase(post.title);
    if (storedTitle === searchTerm) {
      res.render("post",{
        title: post.title,
        content: post.content,
        description: post.description,
        image:post.imageUrl,
      });
    }
    });
  });

  // else {
  //   res.status(404).send('City not found');}}

app.get("/posts/:query",function(req,res){
  const searchedTitle = _.lowerCase(req.params.query);
  
postsArray.forEach(function(post) {
  const storedTitle = _.lowerCase(post.title);
  if (storedTitle === searchedTitle) {
    res.render("post",{
      title: post.title,
      content: post.content,
      description: post.description,
      image:post.imageUrl,
    });
  }
});
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

