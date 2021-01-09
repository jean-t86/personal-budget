# Personal Budget
## Table of contents
* [General information](#general-information)
* [Technologies](#technologies)
* [Project Overview](#project-overview)
* [Project Objectives](#project-objectives)
* [Setup](#setup)
* [Endpoints](#endpoints)

## General Information
This is a practice lab from the [Back-end Engineer path on Codecademy](https://www.codecademy.com/learn/paths/back-end-engineer-career-path). The course teaches all the major technologies and skills that a back-end engineer needs to know.

This project comes after completing 55% of the course.

## Technologies
* JavaScript
* Node.js
* Express.js

## Project Overview
For this project, I built an API that allows clients to create and manage a personal budget. Using [Envelope Budgeting principles](https://www.thebalance.com/what-is-envelope-budgeting-1293682), the API allows users to manage budget envelopes and track the balance of each envelope. 

The API follows best practices regarding REST endpoint naming conventions, proper response codes, etc. Data validation is included to ensure users do not overspend their budget!

## Project Objectives

* Build an API using Node.js and Express
* Be able to create, read, update, and delete envelopes
* Create endpoint(s) to update envelope balances
* Use Git version control to keep track of your work
* Use the command line to navigate your files and folders
* Use Postman to test API endpoints

## Setup
In order to run the program, you need to install Node.js on your computer:
* [Download](https://nodejs.org/en/download/) the binaries
* If you use Linux, follow the [installation instructions](https://github.com/nodejs/help/wiki/Installation#how-to-install-nodejs-via-binary-archive-on-linux).

Once installed, install the program's dependencies with `npm install` in your terminal with the project's folder as working directory.

You can then start the Express server by typing `node webapi.js`.

## Endpoints
Once you have the server up and running, the following end points will be reachable in `http://localhost:4001/`:

GET
* `/api/envelopes` - returns all envelopes
* `/api/envelopes/:id` - returns an envelope by id

POST
* `/api/envelopes` - creates a new envelope
* `/api/envelopes/:id/withdraw/:amount` - withdraws amount from an envelope
* `/envelopes/:id/:to/:amount` - transfer amount from one envelope to another

DELETE
* `/api/envelopes/:id` - deletes an envelope by id
