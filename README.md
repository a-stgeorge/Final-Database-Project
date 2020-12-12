# Final-Database-Project

Setup Prerequisites and Launch Instructions:
- NodeJS must be installed
- Place a 'credentials.txt' file in the root of the project (next to this README), this should contain your Mariadb
    username and password on two separate lines
- Start up ssh tunnel to wiebe on port 3306. A command you could run might look like:
    ```ssh <username>@shell.mathcs.bethel.edu -L3306:localhost:3306```
    This needs to be running in the background for this project to work!
- Navigate to 'Echidna' folder and type ```npm install``` (this only needs to happen once but is harmless 
    if run multiple times)
- When ready to start the project, type ```npm start```
- Open browser and navigate to localhost:3000

Things to notice:
- Notice how easy and streamlined this project is!
- We worked hard on 'dynamic' effects for some pages. For example, selecting an offering from the drop down on the
    4th page (assign instructors to offerings) shows what instructor(s) are assigned to that offering. These dynamic
    actions are spread throughout the project.
- The time warp buttons are nice and streamlined, in one request to our server (and then to mariadb) the warp happens.
    A nice success message should show up upon successful warp.
- The course clusters designation page is made to be readable and easy to use. Selecting clusters consists of selecting
    the corresponding checkboxes and pressing the Create cluster button. Then, the new cluster will be added to the 
    Current clusters table.
- We tried to do good front end validation before sending queries to the database. This allows for more friendly messages
    rather than harse database errors (some errors may have slipped through :) ).