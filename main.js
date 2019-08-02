
const app = new (require('koa'))();

const parser = require('koa-bodyparser');
const cors = require('@koa/cors');
const koaStatic = require('koa-static');
const mount = require('koa-mount');

const router = require('./src/index');
const port = 2228;


app.use(parser());


app.use(mount('/', koaStatic(__dirname+'/public')));
app.use(cors({origin: '*'}))

app.use(router.allowedMethods())
    .use(router.routes())
    .listen(port, '127.0.0.1', () =>{
    console.log(`listening on port ${port}`)
});