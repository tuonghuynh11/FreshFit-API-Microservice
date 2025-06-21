# 🥗 FreshFit Backend

> **FreshFit** – An intelligent, microservice-based health assistant system that integrates food recognition, personalized nutrition recommendations, and workout planning to empower users to lead healthier lifestyles.

---

## 📖 Description

FreshFit is a comprehensive backend system designed for a smart health support application. It leverages **microservice architecture** to deliver scalable, maintainable, and modular services that cover all aspects of personal health management, including food recognition, fitness tracking, and custom nutrition plans.

Key features:

- 🔐 Authentication with JWT
- ⚙️ Microservice-based structure for scalability and modularity
- 📆 Rich service layer (nutrition, fitness, social, planning, recommendations, and more)
- 📈 Integrated monitoring and logging system with **Grafana**, **Prometheus**, **Loki**, and **Jaeger**
- 💇 Asynchronous messaging using **RabbitMQ**
- ⚡ Caching with **Redis**
- ☁️ Cloud-based storage via **Cloudinary**
- 📧 Email notifications with **Nodemailer** and **Mustache**
- ↩️ Background jobs with **cron**
- 🤖 AI integration: **Gemini**, **Serper**, **FatSecret API**
- 🐳 Containerized deployment using **Docker** on **VPS (Vultr/DigitalOcean)**

### 🧩 System Architecture

![System Architecture](https://res.cloudinary.com/dfo5tfret/image/upload/v1750503878/System_Design_FreshFit_V2_1_dmm0hw.png)

---

## 🛠 Installation Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/tuonghuynh11/FreshFit-API-Microservice.git
```

### 2. Environment Configuration

Create an `.env` file in the root of each service directory based on its respective `.env.example`:

```bash
cp .env.example .env
```

### 3. Start Services (Dev Mode)

Make sure Docker and Docker Compose are installed.

```bash
docker-compose up --build
```

This will launch all microservices, including:

- API Gateway
- All backend services (user, health, nutrition, fitness, etc.)
- RabbitMQ, Redis, MongoDB, PostgreSQL
- Monitoring stack (Grafana, Prometheus, Loki, Jaeger)

### 4. API Access

- Gateway: `http://localhost:8080`
- Each microservice runs on internal ports through the gateway.

---

## 📚 Learn More

### 📌 Microservices Overview

#### Core Stack

- **Common Stack** for most services: `Express.js`, `TypeScript`, `MongoDB`, `express-validator`, `formidable`

#### Individual Services:

| Service                  | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `gateway`                | Routing, authentication, rate limiting, caching          |
| `users-service`          | User management, profile, authentication                 |
| `appointments-service`   | Appointment scheduling and history (PostgreSQL, TypeORM) |
| `health-service`         | Health records and biometric tracking                    |
| `nutrition-service`      | Food logging, nutrition recommendation                   |
| `fitness-service`        | Exercise tracking, fitness recommendations               |
| `plan-service`           | Daily and weekly planning                                |
| `challenge-service`      | Workout/diet challenges                                  |
| `social-service`         | User interactions and social feed                        |
| `notification-service`   | Push and real-time notifications (Expo, Socket.IO)       |
| `reporting-service`      | User reports and analytics                               |
| `transaction-service`    | Payment and transaction management                       |
| `recommendation-service` | AI-based recommendation engine (Python, FastAPI)         |

### 🧐 AI & Integrations

- **Gemini** – AI assistant for recommendations
- **Serper** – Search engine integration
- **FatSecret** – Nutrition API
- **Cloudinary** – Image and video storage

---

## 🔄 CI/CD

The project uses GitHub Actions for CI/CD. The workflow is defined in [`.github/workflows`](.github/workflows)
We use GitHub Actions for continuous integration and delivery.

- **Build and Test**: Automatic build and lint check on PRs
- **Dockerized Deployment**: Auto-build Docker images for each service
- **VPS Deployment**: Manual or script-based deployment via SSH to Vultr/DigitalOcean instances
- **Health Checks**: Monitored by Prometheus and displayed on Grafana dashboards
- **Logs & Tracing**: Centralized logging via Loki and distributed tracing with Jaeger

---

Feel free to contribute, raise issues, or fork the repo to improve the future of health tech! 🚀
