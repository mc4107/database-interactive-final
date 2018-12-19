const http = require('http');
const url = require('url');
const query = require('querystring');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const getJSON = require('get-json');
const session = require('express-session');
const $ = require('jquery');
const axios = require('axios');

const index = fs.readFileSync(`${__dirname}/../client/homepage.html`);
const research = fs.readFileSync(`${__dirname}/../client/research.html`);
const settings = fs.readFileSync(`${__dirname}/../client/settings.html`);
const login = fs.readFileSync(`${__dirname}/../client/login.html`);
const register = fs.readFileSync(`${__dirname}/../client/register.html`);
const js = fs.readFileSync(`${__dirname}/../client/client.js`);
const css = fs.readFileSync(`${__dirname}/../client/styles.css`);
const facultyLogo = fs.readFileSync(`${__dirname}/../client/facultylogo.png`);
const userLogo = fs.readFileSync(`${__dirname}/../client/userlogo.png`);

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    key: 'sessionId',
    secret : 'team23',
    resave: true,
    saveUninitialized: true,
  }
));

app.get('/', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
});

app.get('/homepage.html', (request, response) =>{
  const parsedUrl = query.parse(request._parsedOriginalUrl.query);
  console.log(parsedUrl);
  if(parsedUrl != {}){
    request.session.filter = parsedUrl.category ? parsedUrl.category : parsedUrl.filterProfessor;
  }
  console.log(request.session.filter);
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
});

app.get('/research.html', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(research);
  response.end();
});

app.get('/settings.html', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(settings);
  response.end();
});

app.get('/login.html', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(login);
  response.end();
});

app.get('/register.html', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(register);
  response.end();
});

app.get('/client.js', (request, response) =>{
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(js);
  response.end();
});

app.get('/styles.css', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
});

app.get('/facultylogo.png', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(facultyLogo);
  response.end();
});

app.get('/userlogo.png', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(userLogo);
  response.end();
});

// API calls

app.get('/getAllStudents', (request, response) => {
  const url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/getAllStudents.php';

  const apiReq = http.get(url, (res) => {
    res.on('err', (err) => {
      console.log(err);
    });

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return response.json(parsedData);
      } catch (e) {
        console.log('error');
        console.error(e.message);
      }
    });
  });
});

app.get('/getAllProfessors', (request, response) => {
  const url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/getAllProfessors.php';

  const apiReq = http.get(url, (res) => {
    res.on('err', (err) => {
      console.log(err);
    });

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return response.json(parsedData);
      } catch (e) {
        console.log('error');
        console.error(e.message);
      }
    });
  });
});

app.get('/getStudentInfo', (request, response) => {
  let url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/getStudent.php?';
  let options = '';
  options += 'studentId=' + request.session.userId;

  url += options;

  getJSON(url, (error, res) => {
    if (!error) {
      return response.json(res);
    } else {
      console.log(error);
      return error;
    }
  });
});

app.get('/getProfessorInfo', (request, response) => {
  let url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/getProfessor.php?';
  let options = '';
  options += 'professorId=' + request.session.userId;

  url += options;

  getJSON(url, (error, res) => {
    if (!error) {
      return response.json(res);
    } else {
      console.log(error);
      return error;
    }
  });
});

// YOU WERE GIVING THE SESSION USERID BACK TO THE CLIENT
app.get('/returnSession', (request, response) => {
  if(request.session){
    let info = {
      userId: request.session.userId, 
      userRole: request.session.userRole, 
      userName: request.session.userName,
      filter: request.session.filter
    };

    if(request.session.loggedIn){
      info.loggedIn = request.session.loggedIn;
    } else {
      info.loggedIn = false;
    }
    return response.json(info);
  } else {
    return response.json({"message": 'No session available'});
  }
});

app.get('/getAllResearch', (request, response) => {
  let url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/research/getAll.php';

  const apiReq = http.get(url, (res) => {
    res.on('err', (err) => {
      console.log(err);
    });

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        return response.json({results: parsedData, filter: request.session.filter});
      } catch (e) {
        console.log('error');
        console.error(e.message);
      }
    });
  });
});

app.get('/loadUser', (request, response) => {

  if(request.session.loggedIn) {
    const url = 'http://ist-serenity.main.ad.rit.edu/~iste330t23/research_database/api/user/get.php?userId=' + request.session.userId;

    getJSON(url, (error, res) => {
      if (!error) {
        request.session.userRole = res.role;
        request.session.userName = res.name;
        return response.json(res);
      } else {
        console.log('error');
        return error;
      }
    });
  } else {
    return response.json({"role": "Guest"});
  }
 
});

app.post('/login', (request, response) => {
  request.session.userId = request.body.userId;
  request.session.loggedIn = true;
  console.log(request.session.userId);
  console.log('login');
  return response.json({"message": "success"});
});

app.get('/signout', (request, response) => {
  if(request.session) {
    request.session.destroy();
  }
  console.log('signout');
  return response.json({"message": "logged out"});
});

app.listen(port, (err) => {
  if(err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});