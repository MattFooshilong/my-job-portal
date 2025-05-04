# Instructions

To run in development:

cd server;npm start (starts the server)  
cd client;npm start (starts the client)

This project uses access and refresh JWT to log users in and out. An access token is given to the client everytime it expires, for the duration of the refresh token. This stops when the refresh token has expired.  
Both tokens' expiry is set in the authController and verifyToken files
