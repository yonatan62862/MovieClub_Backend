module.exports = {
  apps : [{
    name   : "MovieClub",
    script : "./dist/app.js",
    env_production : {
      NODE_ENV: "production"
    }
  }]
}
