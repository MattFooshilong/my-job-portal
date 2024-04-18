To run in development:

npm run dev (starts the server)  
cd client  
npm run start (starts the client)

This project uses access and refresh JWT to log users in and out. An access token is given to the client everytime it expires, for the duration of the refresh token. This stops when the refresh token has expired
Both tokens' expiry is set in the authController and verifyToken files

