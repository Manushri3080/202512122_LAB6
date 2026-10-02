# LAB 6 – Docker & Microservices

## 1. Objective

The objective of this lab is to design, implement, containerize, and run a simple microservices-based application using Spring Boot, MongoDB, Docker, and Docker Compose.

The application consists of three independent microservices:

- User Service
- Product Service
- Order Service

Each service owns its own database and runs in a separate Docker container. The services communicate with each other through REST APIs over a shared Docker network.

---

## 2. Project Overview

The CampusConnect application is divided into three microservices:

### User Service

Responsible for managing user resources.

- Port: `3001`
- Database: `userdb`
- MongoDB Container: `user-mongodb`

### Product Service

Responsible for managing product resources.

- Port: `3002`
- Database: `productdb`
- MongoDB Container: `product-mongodb`

### Order Service

Responsible for managing orders and validating the referenced user and product before creating an order.

- Port: `3003`
- Database: `orderdb`
- MongoDB Container: `order-mongodb`

---

## 3. Technology Stack

- Java 21
- Spring Boot
- Spring Data MongoDB
- MongoDB
- Maven
- Docker
- Docker Compose
- REST APIs
- Postman
- Docker Bridge Network

---

## 4. Microservices Architecture

The application follows a microservices architecture in which each service is independently deployable and has ownership of its own database.

The services communicate through REST APIs using the shared Docker network:

```text
                         Postman / Client
                                |
              +-----------------+-----------------+
              |                 |                 |
              v                 v                 v
       User Service      Product Service     Order Service
          :3001              :3002               :3003
              |                 |                  |
              v                 v                  v
         userdb             productdb            orderdb
              |                 |                  |
       user-mongodb      product-mongodb      order-mongodb

                              Order Service
                              /           \
                             /             \
                            v               v
                     User Service     Product Service
                    GET /users/{id}  GET /products/{id}

5. Service Ports

| Service         |    Port |
| --------------- | ------: |
| User Service    |  `3001` |
| Product Service |  `3002` |
| Order Service   |  `3003` |
| User MongoDB    | `27017` |
| Product MongoDB | `27018` |
| Order MongoDB   | `27019` |

6. Service Responsibilities

| Service         | Responsibility                                                  |
| --------------- | --------------------------------------------------------------- |
| User Service    | Create, retrieve, update and delete users                       |
| Product Service | Create, retrieve, update and delete products                    |
| Order Service   | Create and retrieve orders and validate User/Product references |


7. API Endpoints
User Service
Method	Endpoint	Description
GET	/users	Get all users
GET	/users/{id}	Get a user by ID
POST	/users	Create a user
PUT	/users/{id}	Update a user
DELETE	/users/{id}	Delete a user
Product Service
Method	Endpoint	Description
GET	/products	Get all products
GET	/products/{id}	Get a product by ID
POST	/products	Create a product
PUT	/products/{id}	Update a product
DELETE	/products/{id}	Delete a product
Order Service
Method	Endpoint	Description
GET	/orders	Get all orders
GET	/orders/{id}	Get an order by ID
POST	/orders	Create an order
8. Inter-Service Communication

The Order Service communicates with the User Service and Product Service before saving an order.

User Validation
Order Service
     |
     | GET /users/{id}
     v
User Service

The User Service verifies that the referenced user exists.

Product Validation
Order Service
     |
     | GET /products/{id}
     v
Product Service

The Product Service verifies that the referenced product exists.

If either dependency is unavailable, the Order Service returns a service-unavailable response.

9. Database Ownership

Each microservice has its own MongoDB database.

Service	MongoDB Container	Database
User Service	user-mongodb	userdb
Product Service	product-mongodb	productdb
Order Service	order-mongodb	orderdb

The services do not share application data directly between databases.

10. Docker Network

All application and MongoDB containers are connected to the following Docker network:

campusconnect-network

Docker service names are used for communication between containers instead of localhost.

For example:

Order Service → http://user-service:3001
Order Service → http://product-service:3002
11. Environment Variables

The services use environment variables to configure ports, database connections, and inter-service URLs.

User Service
USER_SERVICE_PORT=3001
MONGO_URI=mongodb://user-mongodb:27017/userdb
Product Service
PRODUCT_SERVICE_PORT=3002
MONGO_URI=mongodb://product-mongodb:27017/productdb
Order Service
ORDER_SERVICE_PORT=3003
MONGO_URI=mongodb://order-mongodb:27017/orderdb
USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
12. Docker Images

The following Docker images were created:

campusconnect-user-service:latest
campusconnect-product-service:latest
campusconnect-order-service:latest

MongoDB uses the official:

mongo:latest
13. Docker Compose

Docker Compose is used to start the complete application stack.

The Compose configuration starts:

User MongoDB
Product MongoDB
Order MongoDB
User Service
Product Service
Order Service

The services are connected through campusconnect-network.

Start the complete application using:

docker compose up -d

Check the running containers using:

docker compose ps

Stop the application using:

docker compose down
14. Running the Application
Build the services

Each Spring Boot service is packaged as a JAR using Maven.

Example:

mvn clean package

The generated JAR files are located inside the respective target directories.

Start Docker Compose

From the LAB6 directory:

docker compose up -d
Verify containers
docker compose ps

All six application/database containers should be running.

15. API Testing

The APIs were tested using Postman.

The following operations were tested:

User API requests
Product API requests
Order API requests
Inter-service communication
Invalid resource requests
Dependency failure
Dependency recovery
16. Error Handling
404 Not Found

A request for a resource that does not exist returns:

404 Not Found

This was tested for invalid resource IDs.

503 Service Unavailable

When a required dependency of the Order Service is unavailable, order creation fails with:

503 Service Unavailable

This verifies that the Order Service correctly handles dependency failures.

17. Dependency Failure and Recovery

The Order Service depends on both the User Service and Product Service.

The failure scenario was tested by stopping a required dependency and attempting to create an order.

The Order Service returned:

503 Service Unavailable

After restarting the dependency, the Order Service was able to communicate with it again and continue processing requests.

18. Architecture Diagram

The final architecture diagram represents:

Postman / Client
User Service
Product Service
Order Service
User MongoDB
Product MongoDB
Order MongoDB
Shared Docker network
Order → User communication
Order → Product communication

19. Testing Evidence

Screenshots/evidence collected during the lab include:

Docker images
Docker network
Docker Compose configuration
Running Docker containers
Spring Boot service startup
Postman API requests
Successful API responses
404 error responses
503 dependency failure
Successful recovery after restarting a dependency
Final architecture diagram

20. Troubleshooting
Docker daemon not running

If Docker commands cannot connect to the Docker API, Docker Desktop must be running.

MongoDB connection failure

Verify that the required MongoDB container is running:

docker ps
Check all containers
docker compose ps
Check service logs
docker compose logs user-service
docker compose logs product-service
docker compose logs order-service
Restart the complete application
docker compose down
docker compose up -d

21. Conclusion

The Lab 6 application demonstrates a Dockerized Spring Boot microservices architecture with independent MongoDB databases.

The three services communicate through REST APIs over a shared Docker network. Dockerfiles are used to containerize the services, while Docker Compose is used to manage the complete application stack.

The implementation also demonstrates inter-service validation, HTTP error handling, dependency failure handling, and recovery.


