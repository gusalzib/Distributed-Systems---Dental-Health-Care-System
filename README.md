# Dentime - Dental Health Care System

![High-Level Systems Overview](dentist_overview.png)

A distributed dental appointment booking system designed for residents of Gothenburg. This platform allows users to find available time slots for various dental clinics on an interactive map, and seamlessly book or cancel appointments. The project is built using a microservices architecture, leveraging MQTT for messaging and Docker for containerization, ensuring high scalability, distribution transparency, and fault tolerance.

## Architecture and Microservices

The application is structured as a collection of distributed components communicating over an MQTT message broker and HTTP REST APIs, completely containerized using Docker.

### Core Services

- **Client Patient UI (`client_patient`)**: A responsive Vue.js frontend where patients can explore dental clinics on a map, view available time slots, and manage their bookings.
- **API Gateway (`api_gateway`)**: Acts as the single entry point for the frontend, routing requests to the appropriate backend microservices.
- **Patient Management Service (`patient_management_service`)**: Handles patient registration, authentication, and user profiles.
- **Appointment Management Service (`appointment_management_service`)**: The core engine for handling booking transactions, scheduling, and cancellations.
- **Dentist Management Service (`dentist_management_service`)**: Manages dentist profiles, schedules, and specific dentist data.
- **Dentist Clinic Service (`dentist_clinic_service`)**: Keeps track of clinic locations (integrated with MapQuest Geocoder), and general clinic information.
- **Monitoring Service (`monitoring_service`)**: Monitors the health and status of the different Docker containers and services in the system.
- **MQTT Broker (`mosquitto-broker`)**: Eclipse Mosquitto broker that facilitates asynchronous messaging (publish/subscribe) between the distributed backend services.
- **Reverse Proxy (`nginx`)**: NGINX server routing traffic to the API Gateway.
- **Database (`mongo`)**: MongoDB instance storing persistent data for patients, clinics, dentists, and appointments.

## Technologies Used

- **Frontend**: Vue.js, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Messaging Protocol**: MQTT (Eclipse Mosquitto)
- **Containerization**: Docker, Docker Compose
- **Proxy**: NGINX

## Setup and Installation

The entire application can be easily spun up using Docker.

### Prerequisites
- [Docker](https://www.docker.com/get-started/) installed on your machine.
- Docker Compose.

### Running the Application

1. **Create the Docker network** (This is required for the services to communicate):
   ```bash
   docker network create --driver bridge my-network
   ```

2. **Build and start the services**:
   Navigate to the `dentalHeathcareSystem` directory where the `docker-compose.yml` is located and run:
   ```bash
   cd dentalHeathcareSystem
   docker-compose up --build
   ```

3. **Access the application**:
   Once all containers are running, you can access the Web GUI at:
   [http://localhost:8080/](http://localhost:8080/)

### Useful Docker Commands

- **Stop the services**:
   ```bash
   docker-compose down
   ```
- **Scale a specific service** (e.g., to run 3 instances of the appointment service):
   ```bash
   docker-compose up --build --scale appointments-service=3
   ```
- **View running containers**:
   ```bash
   docker ps
   ```
- **View logs for a specific service**:
   ```bash
   docker logs <container-name>
   ```

## Features

- **Interactive Map**: View Gothenburg dental clinics directly on a map view.
- **Live Availability**: Clinic availability and free time slots are updated in real-time.
- **Booking Management**: Patients can securely book and cancel appointments.
- **Notifications**: Users are notified regarding their appointment status (confirmations, rejections, and cancellations).
- **Fault Tolerance**: The system is designed to handle component failures gracefully, ensuring core services remain available.

## Contributors
Developed as part of the Distributed Systems course (DIT342).
