##Middleware

Middlewares are defined in the middleware directory. For example the error handler middleware
is defined in the error_handler.js file. These middlewares should be reusable in other projects. 

##Route

Routes are defined in the routes directory.

##Start Service

### Production mode

>npm start

### Debug mode

>DEBUG=*:* npm start

###Specify env

The following command will start the server on port 9000.

```
$PORT=9000 npm start
```