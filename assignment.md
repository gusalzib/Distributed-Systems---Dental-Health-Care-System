# Introduction

Our teeth are one of our most precious tools. We often don’t appreciate them enough until we lose them, for instance due to bad dental care. Doing annual checks with a dentist is therefore recommended. For someone moving to Sweden, or within Sweden, it is not always easy to get a dentist appointment as many practices are working on full capacity already and will reject you as a new care-taker. As a consequence, as of today, you are required to do a manual search online, and additional time-taking calls with little chance of success.

# Task Overview

You will create a service that allows residents of Gothenburg to book dentist appointments. Through a Web-based graphical user interface, a user shall be able to find available times in user- specified time-windows on map. Your solution will be based on a distributed system that combines various architectural styles. You will keep track of the availability of free time-slots for a number of fictitious dentists which you graphically signal to the user. A user is able to book appointments and receives a confirmation/rejection through the system. A high-level conceptual overview of the system is shown below.

[High-Level Systems Overview](dentist_overview.png)

The system has (at least) the following core components:

- A responsive Web-based graphical user interface (GUI) for prospective patients to find and book appointments. You are free to use any framework you like for the GUI, but we recommend using Vue.js in line with DIT342.
- A scalable middleware layer that stores and manages appointment slots. The middleware layer needs to make use of messaging as an architectural paradigm, and needs to persistently store slots and appointments in a database. The middleware layer also needs to offer an API for dentists to register open slots and be notified when slots have been booked, or bookings have been cancelled.
- A tool (does not need to be Web-based) for dentists to register their available time slots and receive bookings / cancellations. The tool needs to be able to communicate with the middleware layer through the API. This tool is mainly used for demonstration and testing, it is intended that real dental clinics would integrate the middleware API into their own systems.

# Requirements

## General

- The system needs to follow the high-level outline discussed above, and offer at least the discussed functionality in a user-friendly, usable manner.
- A middleware based on the MQ Telemetry Transport (MQTT) protocol must be used.
- Components communicating via middleware have no knowledge about the physical location of other components, and don’t depend on other components residing at a specific physical location. (Distribution Transparency)
- The system must be reasonably failure tolerant. Specifically:
    - All components must be capable of appropriately handling standard failures, such as wrongly formatted data inputs or out of bounds inputs for the defined interfaces.
    - Resource-handling shall be mindful, e.g. stopped components must unsubscribe from the MQTT broker fulfilling the contract.
- For all components, a reasonable testing strategy needs to be in place. This includes at least unit and integration tests where appropriate.
- The system needs to be maintainable and extensible,as project requirements tend to grow and change. Specifically, be prepared that in early December you will be asked to incorporate some additional requirements and/or changes to the existing requirements.

## Web Interface
The Web-based user interface shall
- contain a map-view over Gothenburg that can be navigated.
- visualize the supply/available slots for appointments (individual or grouped
availability using e.g. color coding or symbols, possibly changing at different
zoom levels...).
- allow for slot selection and booking.
- allow for booking cancellation.
- notify the user when new suitable slots become available.
- react to responses with appropriate messaging to the user.
- react to simultaneous bookings by making changes in availability visible to the
user (without requiring an active refreshing of the interface by the user).
- be equally usable on a range of devices, including mobile devices and tablets.

## Architecture
The task shall be solved through a Distributed System architecture. The Distributed System should execute using a collection of nodes, so that each process is mapped onto a node. Nodes can be either separate hardware nodes, or separate operating system processes. During the final demo, the system must be demonstrated to run on clearly independent processes, either by deploying the system on different cloud VMs or (at least) by starting the programs from different terminal windows on the same machine

The distributed system must consist of at least 4 distributed components, each clearly contributing to the purpose of the application and leading to an overall meaningful architecture. Architectural styles such as Pipe-and-Filter, Publish/subscribe and Client/server are supposed to be combined.

## Technology
You are largely free to choose the technology you want to use for the implementation. However, the middleware needs to indeed use MQTT.

Our suggestion is to use the following technologies. You are free to use other technologies, but we can only provide limited support if you run into problems with other technologies:

- Vue.js for the Web-based GUI
- MongoDB or Postgres as database
- Java as programming language for the middleware
- Eclipse Mosquitto as message broker
- Eclipse Paho as MQTT client library

# Assessment
The project shall be developed in four iterations (MS1 -- MS3 and the final delivery). The project will be assessed along three dimensions: (1) technical artifact (code, tests, demo), (2) architecture (design, architectural documentation), and (3) development process (requirements, issues, traceability between git commits, issues, and requirements, following a pull request based workflow, etc.). Note that assessment may be individual for each group member, if there is a clear discrepancy in contributions based on the git commit history or participation in meetings.

### TODO - better describe requirements w.r.t. to documentation and process

## Requirements per MS

### TODO - describe roughly what we expect in each MS

## Grading

### TODO - describe what we expect for 3/4/5

# Deliverables

### TODO