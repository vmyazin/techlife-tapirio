// app.js

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const sassMiddleware = require("sass-middleware");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "pages"));
app.set("view engine", "pug");

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  sassMiddleware({
    src: path.join(__dirname, "scss"),
    dest: path.join(__dirname, "public/stylesheets"),
    debug: true,
    outputStyle: "compressed",
    prefix: "/stylesheets",
  })
);
app.use(express.static(path.join(__dirname, "public")));

// Initialize project data
const Project = require("./scripts/app.functions");
const BLOG_PATH = path.join(__dirname, "content", "articles");
const PODCAST_FEED_XML = path.join(__dirname, "public", "podcast-feed.xml");

const project = new Project(BLOG_PATH, { podcastFeedXml: PODCAST_FEED_XML });

// This should be an async function
async function initializeProject() {
  await project.init();
  project.sortBy({ property: "date", asc: false });

  const podcast = project.podcastModule.json.rss;
  const episodes = podcast.channel.item.map((episode) => {
    // Your episode mapping logic here
    return episode;
  });

  // Set up locals after data is initialized
  app.locals.episodes = episodes;
  app.locals.projectInfo = project.info;
  app.locals.projectInfo.currentYear = new Date().getFullYear();

  console.log('Application initialization complete.');
}

// Call the initialization function
initializeProject().catch(console.error);

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

// Custom 404 handler
app.use(function (req, res, next) {
  res.status(404).render('404', {
    message: "Запрашиваемая страница не найдена",
    title: "404 - Страница не найдена",
    path: req.path || ''
  });
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error", {
    path: req.path || ''
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

module.exports = app;