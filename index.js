const express = require('express')
const mountRoutes = require('./routes')
const app = express()
mountRoutes(app)

app.set('port', (process.env.PORT || 5890));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

