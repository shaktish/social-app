## Dependencies 
cors 
dotenv
express
express-http-proxy
helmet
ioredis
jsonwebtoken
winston for logger 

### api-gateway-service  
npm i express dot-env cors jsonwebtoken ioredis winston express-http-proxy helmet 

npm install --save-dev typescript @types/express @types/node @types/cors @types/jsonwebtoken @types/helmet @types/express-http-proxy @types/winston ts-node-dev

npx tsc --init

### identity-service
npm i express dot-env cors jsonwebtoken ioredis winston argon2 express-rate-limit joi mongoose rate-limit-redis


npm install --save-dev typescript @types/express @types/node @types/cors @types/jsonwebtoken @types/helmet @types/express-http-proxy @types/winston ts-node-dev @types/joi

### post-service
npm init -y 
npx tsc --init 

Dependencies
```js
npm i express dotenv cors winston joi ioredis mongoose helmet jsonwebtoken ts-node-dev typescript

npm i -D @types/express @types/cors @types/joi @types/ioredis @types/helmet @types/jsonwebtoken @types/node
```
ts-config 
```js
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "typeRoots": ["./types", "./node_modules/@types"],
    "types": ["node", "express"]
  },
  "include": ["src/**/*.ts"]
}

```
 package.json 
 ```js
{
  "name": "post-service",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^4.18.2",
    "helmet": "^8.1.0",
    "ioredis": "^5.6.1",
    "joi": "^17.13.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.16.0",
    "winston": "^3.17.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^4.17.21",
    "@types/helmet": "^4.0.0",
    "@types/ioredis": "^5.0.0",
    "@types/joi": "^17.2.3",
    "@types/jsonwebtoken": "^9.0.10"
  }
}
 ```

### media-service 
 dependencies 
 ```javascript 
npm i express dotenv cors winston joi ioredis mongoose helmet jsonwebtoken ts-node-dev typescript 

// for image upload
npm i cloudinary multer

npm i -D @types/express @types/cors @types/joi @types/ioredis @types/helmet @types/jsonwebtoken @types/node
 ```

### search-service 
```javascript
npm i express dotenv amqplib cors helmet joi jsonwebtoken mongoose winston ioredis 
npm i --save-dev typescript @types/express @types/dotenv @types/amqplib @types/cors @types/helmet @types/joi @types/jsonwebtoken @types/mongoose @types/winston @types/node
```

## Winston logger
it configures a winston logger for a nodejs application, This logger
- output logs to the console (with colors during development)
- stores error logs in a file called error.log
- stores all logs (of all levels) in combined.log 


### Logger creation 
- "debug" for development: shows everything.
- "info" for production: hides debug messages (shows info, warn, error).

```javascript
  level: config.env === "production" ? "info" : "debug",
```

### Format Configuration
This defines how log messages are formatted internally
- timestamp() : adds a timestamp to each log,
- errors({stack:true}): if an error is logged, its stack trace is included 
- splat() : enables string interpolation like logger.info('hello %s', 'World)
- json(): Outputs logs in JSON format.


```javascript
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),

  ```

### metadata 
- Adds metadata to each log. Useful in microservices:
- "service" key tells which service generated the log.
```javascript
defaultMeta: { service: "identity-service" }
```

### Transports (Where Logs Go)
Winston lets you define multiple "transports" — places to write logs to.

1. Console Transport (for terminal)
- Only meant for developer readability.


```javascript
   new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),   // Adds color to log levels (debug/info/warn/error)
        winston.format.simple()      // Simple, human-readable format
      ),
    }),
```
2. Error File
Logs only error level logs to error.log.

``` javascript     
new winston.transports.File({ filename: 'error.log', level: 'error' })
```
3. Combined file 
Logs all levels (debug, info, warn, error) to combined.log.
```javascript 
    new winston.transports.File({ filename: 'combined.log' })
```


## helmet
helmet is a Node.js middleware (usually used with Express) that helps secure your app by setting various HTTP headers.
- It sets security-related HTTP headers to protect your app from common web vulnerabilities.


Basically we have these security stuffs to handle following security attacks 
1. 🦠 XSS
  - is a security vulnerability where an attacker injects malicious JavaScript code into your website. This code runs in the browser of another user — not on your server.
  - if we don't sanitize user data before sending it to client if its a script its executable and this can steal user's data
2. 🪞 Clickjacking
  - Attacker embeds your site inside an invisible <iframe> on a malicious page and tricks users into clicking hidden buttons (like “Buy” or “Delete”).
3. 🧪 MIME Sniffing 
  - MIME Sniffing is a browser behavior where the browser guesses the type of content (MIME type) it receives from a server, instead of trusting what the server explicitly says.

``` javascript
// Create a simple Express server and:
// Allow .txt uploads.

// Upload this content in a file:
// <script>alert(document.domain)</script>
// Serve it without the nosniff header.
// Open the file in Chrome or Edge → the script runs.
// Then add X-Content-Type-Options: nosniff and see how the browser no longer executes the script — just shows it as text.

```
4. 🕵️ Information Leakage
  - Information Leakage (also called Information Disclosure) happens when your 
  - application accidentally exposes sensitive data that an attacker can use to:
        - Plan further attacks, 
        - Exploit system weaknesses, Or 
        - just steal valuable information.
- 🛡️ How to Prevent Information Leakage
  - Error Handling	Show generic errors to users, log details internally
  - Stack Traces	Only show in development mode
  - Headers	Use middleware to hide server info (helmet in Express)
  - Logs	Sanitize logs, avoid logging passwords, tokens
  - URLs	Use POST + body for sensitive data, not query params
  - Files	Restrict access to .env, source code, logs
5. - 🔒 Man-in-the-Middle (MITM)
  - A Man-in-the-Middle (MITM) attack happens when an attacker secretly intercepts or alters communication between two parties (like you and a website), without either party knowing.
  - Think of it like this: you're whispering a secret to your friend, but a person in the middle hears or changes it before it reaches them.
🧨 Real-World Example : 1. Public Wi-Fi Attack ☕
- The attacker on the same Wi-Fi:
- Intercepts the data (sniffs passwords, messages)
- Alters it (injects fake login form)
- If it’s HTTP (not HTTPS), your login credentials are visible in plain text!
6. 🌐 Referrer Leaks
- When a user clicks a link from your site to another, the browser sends the full URL (including query params) as the Referrer header. This might leak sensitive data.
- Use the Referrer-Policy HTTP header
- Referrer-Policy: no-referrer


## node-rate-limiter-flexible
a powerful Node.js library for applying rate limiting in your Express app (or any Node service) to prevent abuse like brute-force attacks or DDoS attempts.

A robust rate limiting library that supports:
- In-memory, Redis, MongoDB, or MySQL-based limits
- Per-IP, per-user, or any key
- Burst-friendly "sliding window" and "token bucket" strategies
- Integration with Express, Koa, etc.



``` npm i node-rate-limiter-flexible ```


## ioredis 
start ioredis in wsl command line 
- ``` sudo service redis-server start ```

Purpose:
- Improve performance by caching API responses.
- Reduce load on MongoDB.
- Serve faster responses for repeated requests.

1. connect to redis 
```javascript
const redisClient = new Redis(config.redisUrl);
req.redisClient = redisClient;
```
1. Store API Response in Cache

```javascript
redisClient.setex(key, ttlInSeconds, JSON.stringify(data));

```
3. Fetch from Cache Before DB
```javascript
const cachedData = await redisClient.get(key);
if (cachedData) return res.json(JSON.parse(cachedData));
```
4. Invalidate Cache on Data Change
```javascript
redisClient.del(singlePostKey);
redisClient.keys(allPostsPattern).forEach(key => redisClient.del(key));
```

 Key Benefits:
- ⚡ Faster API responses
- 🧠 Reduced DB queries
- 🔄 Auto-expiry ensures freshness
- ✅ Manual invalidation maintains data accuracy

Rate Limiting with Redis – Short Notes
Why Use Redis?
- Redis is fast and in-memory, perfect for tracking requests per IP/user.
- It supports auto-expiry, so limits can reset (e.g., every minute).
1. install middleware
``` npm install express-rate-limit rate-limit-redis ```
2. Setup with Redis Store:
```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis(config.redisUrl);

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
```

### 🚦 How It Works:
For each request:
- Redis increments a count tied to the IP.
- If count exceeds max in the windowMs, it blocks the request.
- After windowMs, the count auto-resets.

### Benefits:
- Prevents API abuse and DoS attacks.
- Works across multiple servers (Redis is shared).
- Easy to tweak limits per route/user.

## API Gateway with Proxy
What is an API Gateway?
- It acts as a single entry point to your backend services (microservices).
- It can route requests to various services like auth, user, payment, etc.
- Think of it as a smart receptionist that forwards your request to the right department.

🔁 Using express-http-proxy for Proxying
- app.use("/v1/auth", proxy(identityServiceUrl, { ...options }));
This means:
- When a request hits /v1/auth, it’s forwarded to identityServiceUrl/api/...
- You changed the path with proxyReqPathResolver
- You decorated headers with proxyReqOptDecorator
- You logged the response with userResDecorator


## ✅ Microservices & Message Broker — Summary
🔹 Core Microservices Principles
Each module (auth, CRUD, search, media) is built as a separate service with its own:
- Database
- RAM & CPU
- Codebase & deployment unit

Services are independently scalable
→ For example, if search traffic spikes, you scale only the Search Service, not the whole system.

Team independence
→ Backend teams can work on separate services (e.g., Media Team vs Auth Team) without conflicts.

Failure isolation
→ A bug or crash in Media Service doesn’t affect CRUD or Auth services.

Optimized storage per use-case
→ Use relational DBs for structured data, Elasticsearch for search, S3 for media, etc.

🔁 Message Brokers in Microservices
To communicate between services asynchronously, use a message broker like:
- ✅ Redis Pub/Sub (lightweight)
- ✅ Redis Streams (durable)
- ✅ RabbitMQ (robust)
- ✅ Kafka (enterprise-grade)

This enables event-driven architecture:
e.g., PostService emits post.created → SearchService receives and indexes it

🟩 Final Verdict
✅ For small-to-medium apps:
- Start with a modular monolith using NestJS
- Logical modules (auth, post, search) inside one app
- Shared DB for simplicity
- Clean architecture makes it easier to split later

✅ As your app grows:
- Use NestJS Microservices Package to gradually extract services
- Add Redis/Kafka for communication
- Use Docker + Kubernetes for independent scaling


## Status Code
Code	Meaning	When to Use
200	OK	Successful GET, PUT, DELETE
201	Created	Successful POST creating a resource
204	No Content	Successful, no body to return
400	Bad Request	Invalid data or parameters
401	Unauthorized	No or invalid authentication
403	Forbidden	Authenticated but not allowed
404	Not Found	Resource doesn’t exist
409	Conflict	Duplicate resource or version conflict
422	Unprocessable Entity	Validation failed
429	Too Many Requests	Rate limit exceeded
500	Internal Server Error	Unhandled server error
502	Bad Gateway	Upstream service error
503	Service Unavailable	Temporarily overloaded or down
504	Gateway Timeout	Upstream service timeout


## Docker 
What Is Docker?
Docker is an open-source platform that helps you:
- Build
- Package
- Ship
- Run
applications in containers.

Think of containers as lightweight, portable boxes that bundle:
✅ Your application code
✅ All dependencies (libraries, runtimes)
✅ Configurations

This means you can run the same container anywhere, whether it’s:
- Your laptop
- A test server
- The cloud
  
### 🧩 Why Use Docker?
✅ Consistency:
“It works on my machine!” becomes irrelevant. If it runs in a container, it runs the same everywhere.

✅ Isolation:
Each container is isolated from others and the host machine. No conflicts between applications.

✅ Lightweight:
Containers share the host OS kernel, making them faster and smaller than virtual machines.

✅ Portability:
Build once, run anywhere.

✅ Efficiency:
You can run many containers on the same machine.

### 🛠️ Core Concepts
1️⃣ Images
- An image is a blueprint for a container.
- Think of it as a snapshot of everything your app needs.
- Example: An image might include Ubuntu + Node.js + your app code.

2️⃣ Containers
- A container is a running instance of an image.
- You create containers from images.
- Example: Start 3 containers from the same image to scale your app.

3️⃣ Dockerfile
A Dockerfile is a text file with instructions on how to build your image.
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]
```
4️⃣ Docker Hub
- A public repository where you can find and share Docker images.
- Example: docker pull nginx downloads the official NGINX image.

5️⃣ Volumes
- Persistent storage for your containers.
- Data in containers is ephemeral by default (it goes away if you remove the container).
- Volumes keep your data safe.

6️⃣ Networks
- Containers can communicate with each other over Docker networks.

🖥️ Common Docker Commands
Here are some examples:
```
docker pull <image>	Download an image from Docker Hub
docker build -t myapp .	Build an image from a Dockerfile
docker run -d -p 8080:80 myapp	Run a container in detached mode, mapping port 80 inside to 8080 outside
docker ps	List running containers
docker stop <container>	Stop a running container
docker rm <container>	Remove a stopped container
```
###  Windows Installation 
For windows, we need Docker Desktop application and WSL 2 (Windows Subsystem for Linux v2)

🟢 1. Enable WSL 2
- Open PowerShell as Administrator
  - ```wsl --install```
  - Restart your PC when prompted.
🟢 2. Download Docker Desktop
-  Get Docker Desktop Installer:
-  Install Docker Desktop
   -  Use WSL 2 backend (recommended)
🟢 3. Start Docker Desktop and Verify Installation
- open powershell and run ``` docker --version ``` to check if docker is working, you should see something like this "Docker version 25.0.x, build abc123"
- Next, try the official test container 
  - ```docker run hello-world ```
  - If Docker is working properly, you'll see, ```Hello from Docker!```
-  If both these commands work — Docker is running perfectly.


### To install rabbitmq 
Start RabbitMQ version 3 with management UI, in the background, name it ‘rabbitmq’, set the hostname to ‘rabbitmq-host’, and map the internal ports 5672 and 15672 to my local machine so I can connect and see the dashboard
```
  docker run -d \
  --hostname rabbitmq-host \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
```

- 5672	🟢 AMQP protocol port — this is the main port your apps/microservices connect to for sending and receiving messages.
- 15672	🟢 Management Web UI — this is the HTTP dashboard you open in the browser to see queues, exchanges, messages, and logs.

####  explanation 
docker run -d
✅ docker run
- Starts a new container from an image.
✅ -d
- Detached mode = run in the background.
- Without -d, you’d see logs filling your terminal.
✅ Why use it?
- So your container stays running without tying up your terminal.
🔹 --hostname rabbitmq-host
✅ This sets the internal hostname inside the container.
- 👉 Think of it like giving the container a computer name:
✅ Why do it?
- For clarity in logs
- For clustering scenarios (you rarely need this in a single dev container)
- So RabbitMQ thinks it’s called rabbitmq-host rather than a random ID
✅ What if you remove it?
- Nothing breaks—RabbitMQ just uses the default hostname (container ID).
🔹 --name rabbitmq
✅ This gives your container a friendly name:
- rabbitmq
✅ Why do it?
So you can reference it easily:
```
docker stop rabbitmq
docker logs rabbitmq
```
✅ What if you remove it?
- Docker auto-generates a funny name like:
```crazy_euler```
- You can still manage it, but you have to look up its name or container ID.
 -p 5672:5672
✅ This maps ports between your Windows host and the container.
- -p HOST_PORT:CONTAINER_PORT
✅ What does this one do?
- Inside the container, RabbitMQ listens on port 5672 for AMQP connections (your apps talking to RabbitMQ).
  - This makes port 5672 on your host also available.
  - So you can connect from your Node.js app to: ```localhost:5672```
✅ What if you remove it?
- Your RabbitMQ will run, but you can’t connect from your machine.
🔹 -p 15672:15672
✅ Same idea—another port mapping.
- What’s on 15672?
- The RabbitMQ Management Web UI (the dashboard in your browser).
✅ What does this one do?
- Makes the web interface available at:
  - http://localhost:15672
  - default credentials
    - username : guest
    - password : guest
✅ What if you remove it?
- RabbitMQ still runs, but you lose the ability to open the web dashboard.

🔹 rabbitmq:3-management
✅ This is the image name and tag.
- rabbitmq = official RabbitMQ Docker image
- 3-management = version 3 with the management plugin enabled

✅ Why this image?
- Because it: Includes RabbitMQ server 
- Has the web UI built in

✅ What if you use just rabbitmq?
- You get RabbitMQ without the management plugin (no web dashboard).

## What is RabbitMQ?
- RabbitMQ is an open-source message broker.
- Think of it as a post office for your software:
  - Applications send messages to RabbitMQ.
  - RabbitMQ stores them in queues.
  - Other applications consume messages from those queues.

It primarily uses the AMQP protocol (Advanced Message Queuing Protocol) but also supports others (MQTT, STOMP).

### When Should You Use RabbitMQ?
- You should use RabbitMQ when you need to decouple systems and communicate asynchronously, especially in scenarios where:
- Operations take time or could fail temporarily (e.g., network delays, service downtime).
- You need reliable delivery, persistence, and message acknowledgment.
- You want to scale parts of the system independently.

### RabbitMQ: assertQueue vs assertExchange
✅ assertQueue
- Creates a queue.
- Publisher sends directly to the queue (sendToQueue).
- Simple, tightly coupled (publisher must know the queue).
- Use case: One-to-one task processing.

✅ assertExchange + bindQueue
- Creates an exchange (e.g., direct, fanout, topic).
- Publisher sends to exchange → exchange routes to one/many queues.
- Consumers bind their queues to the exchange.
- Loosely coupled, flexible routing, scalable.

🎯 Benefits of Using Exchange
- Feature	Description
- Decoupling	Publisher doesn’t need to know queue names.
- Fanout	One message → multiple queues (broadcast).
- Routing	Route messages by key/topic/header.
- Dynamic Binding	Consumers can bind queues at runtime.
- Scalable	Easily add/remove consumers without touching the publisher.

✅ Use exchange when:
- You have multiple consumers.
- You need routing/filtering.
- You want a decoupled, scalable architecture.
