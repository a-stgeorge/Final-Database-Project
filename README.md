# Final-Database-Project

Setup Prerequisites and Launch Instructions:
- NodeJS must be installed
- Place a 'credentials.txt' file in the root of the project, this should contain your Mariadb username and password
    on two separate lines
- Start up ssh tunnel to wiebe on port 3306. A command you could run might look like:
    ssh <username>@shell.mathcs.bethel.edu -L3306:localhost:3306
    This needs to be running in the background for this project to work!
- Navigate to 'Echidna' folder and type npm install (this only needs to be done once unless new packages were added)
- When ready to start the project, run npm start
- Open browser and navigate to localhost:3000
