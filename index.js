const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers for each CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for the 'exit' event and fork a new worker
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  // Listen for the 'fork' event
  cluster.on('fork', (worker) => {
    console.log(`Worker ${worker.process.pid} is forked`);
  });

  // Listen for messages from workers
  cluster.on('message', (worker, message) => {
    console.log(`Message from worker ${worker.process.pid}: ${JSON.stringify(message)}`);
  });
} else {
 
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello, I am a worker!');
  }).listen(8000);

  // Send a message to the master process
  process.send({ type: 'workerStarted', pid: process.pid });

  console.log(`Worker ${process.pid} started`);
}
