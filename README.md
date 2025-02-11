# 🔐 Login Service

The **Login Service** is a microservice developed using Node.js, Express, CouchDB, and WebSockets. Its main functionality is to handle user registration and email verification through a secure API.

---

## 🐳 **Deployment Docker Image**

Visit the repository on Docker Hub [here](https://hub.docker.com/r/lxgonzalez/login-service)

1. **Ensure port 1028 is available**.
2. **Run the following command in your terminal** to pull the latest image:

```bash
> docker pull lxgonzalez/login-service
> docker pull lxgonzalez/login-service:latest
```

## 🚀 **Deployment Locally**

Follow these steps to run the API on your local machine:

1. Clone the Repository

```bash
git clone https://github.com/lxgonzalez/login-service.git
```
2. Install Dependencies
   
```bash
npm install
```
4.  Run the Application
```bash
npm start
```
5. Connecting to the Service

   Once the application is running, you can access the service by opening your browser and navigating to: http://localhost:1028

---

## 📌 API Endpoints
1. **Send Email Verification Code**
- Endpoint: POST /send-email
- Description: Sends a verification code to the user's email.
- Request Body:
  
```json
{
  "email": "luis@gmail.com"
}
```
- Response:
  
```json
{
  "message": "Code sent."
}
```

2. **Validate Email Code**
- Endpoint: POST /validate-code
- Description: Validates the email verification code.
- Request Body:
```json
{
  "email": "luis@gmail.com",
  "code": "123456"
}
```
- Response:

```json
{
  "valid": true,
  "message": "Valid code."
}
```

3. **Register a New User**
- Endpoint: POST /register-user
- Description: Registers a new user after email verification.
- Request body:

```json
{
  "firstName": "Luis",
  "lastName": "Gonzalez",
  "email": "luis@gmail.com",
  "password": "xxxxx",
  "dob": "2000-01-01"
}
```
- Response:

```json
{
  "message": "User registered successfully."
}
```

## 📡 WebSocket Integration

This microservice integrates WebSockets to send email verification codes and user registration data to other services.

- WebSocket Events:
  - send_email_code → Sends a verification code to the user's email.
  - register-client → Registers a new user in the system.

