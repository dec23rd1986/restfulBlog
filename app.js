var bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer"), 
    express             = require("express"),
    app                 = express();

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
// mongoose.connect("mongodb://andrea:Texas123.@ds123124.mlab.com:23124/dog_blog");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE / MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String, 
    // image: {type: String, default: "img01.jpg"},
    body: String,
    created: { type: Date, default: Date.now }
});

var Blog = mongoose.model("Blog", blogSchema);

//RESTFUL ROUTES

app.get("/", function(req, res) {
    res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log("error");
        }
        else {
            res.render("index", { blogs: blogs });
        }
    });
});

//NEW ROUTE - shows the form

app.get("/blogs/new", function(req, res) {
    res.render("new");
}); 

//CREATE ROUTE - new form sends data to the database then redirects back to idex

app.post("/blogs", function(req, res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
    //if fine, redirect to the index
            res.redirect("/blogs");
        }
    })
})

// SHOW ROUTE

app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    })
})

// EDIT - this is the form where people can edit their blog. Blog.findById finds the particular blog post and the information is auto filled with the info

app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
    
});

//UPDATE ROUTE  --blog.findbyidandupdate req.params.id = id, req.body.blog= new data, callback
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE

app.delete("/blogs/:id", function(req, res){
    //destory blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
    //redirect somewhere
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started!");
})


