Please follow bellow instruction to use the code

1. Make sure you have PgAdmin 4 installed on your computer. you can download it through this link https://www.pgadmin.org/download/

2. Make sure you have NodeJS runtime environment installed. You can download it through this link https://nodejs.org/en/download/

3. Create .env file in master folder, that contains text like below

PORT={your Desired Port}
DB_PASSWORD={your PgAdmin Password}

4. Run this command through cmd on main folder
    "npm install"
    "npm run start"

Routes
1. GET /chat/{userId}
    Get list conversation of {userId} is chatting with
    curl -X GET http://localhost:5000/chat/{userId}

2. GET /chat/{userId}/{toUserId}
    Get history chat of {userId} with {toUserId}
    curl -X GET http://localhost:5000/chat/{userid}/{toUserId}

3. POST /chat/{userId}/{toUserId}
    Send message from {userId} to {toUserId}
    curl -X POST -H "Content-Type: application/json" http://localhost:5000/chat/{userId}/{toUserId} -d "{\"message\": \"Hi let's have a talk\"}"


4. POST /chat/{userId}/{toUserId}/{messageId}
    Send reply of spesific {messageId} that available on {userId} chat with {toUserId}
    -X POST -H "Content-Type: application/json" http://localhost:5000/chat/{userId}/{toUsedId}/{messageId} -d "{\"message\": \"Hi\"}"

5. POST /chat/register
    Create new user to chat
    -X POST -H "Content-Type: application/json" http://localhost:5000/chat/register -d "{\"name\": \"Josh\", \"username\": \"joshg\"}"