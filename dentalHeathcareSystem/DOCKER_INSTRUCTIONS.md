### How to start:
1. #### install a docker. 
    I used 'brew install docker' and downloaded the app 'Docker desktop'

2. #### Create a network called my-network. 
    It has to have that name or else you need to change the name in the docker-compose.yml
    command: docker network create --driver bridge my-network

- If you are having problems with the network you can see what networks are already running.
    command: docker network ls

- If it alreade exist you might need to remove it.
    command: docker network rm my-network

- If you want to inspect it.
    command docker network inspect my-network

3. #### Run the docker. 
- Navigate to the folder where the docker-compose.yml is in.
- build the docker and start the service
    command: docker-compose up --build

- if you need to change something in the code. do that, save and rebuild by first removing the old one.
    command: docker-compose down

- to make many instances of a service. example 3 appointments.
    command: docker-compose up --build --scale appointments-service=3
- to see all running services.
    command: docker ps

- to log a service
    command: docker logs <container-name>

4. #### You will find the website on 
    http://localhost:8080/

