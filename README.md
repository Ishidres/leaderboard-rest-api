# leaderboard-rest-api
A simple RESTful API to insert player scores into a local MySQL database, created by a 15 years old student in highschool for a school project.

## Setup
- change the port in config.json to your likings
- set the mysql username, password and tablename in config.json
- create and use a strong api token

## Authentication
All API calls require a token. Calls without a token will result into an error. The token must be the same as the apiToken given in config.json.
#### Invalid/missing token response:
```json
{"error": "invalid_request", "error_description": "A token is required to access this ressource.", "status": "error"}
```

## GET /ping
Calculates the response time between the API call and the response.
#### Parameters:
**timestamp** (int): Timestamp when the call has been done
#### Example request:
```
http://localhost:3000/ping?token=TOKEN&timestamp=1550238783279
```
#### Successful example response:
```json
{"ping": 19, "unit": "ms", "status": "success"}
```
#### Unsuccessful example response:
```json
{"error": "invalid_request", "error_description": "Must provide a valid timestamp.", "status":"error"}
```

## POST /insert
Inserts or updates a user in the leaderboard.
#### Parameters:
**id** (int): ID of the user
**username** (string): The username of the player. Usernames can change between calls, but IDs mustn't.
**score** (float): The score of the user.
#### Example request:
```
http://localhost:3000/insert?token=TOKEN&id=1&username=ishidres&score=50
```
#### Successful example response:
```json
{"status": "success", "description": "The given user information has successfully been updated in the database."}
```
#### Unsuccessful example response:
```json
{"error": "invalid_request", "error_description": "The parameter 'id' is missing or invalid.", "status": "error"}
```
```json
{"error": "unknown_error", "error_description": "This error might have been caused on server side. Please try again later.", "status": "error"}
```