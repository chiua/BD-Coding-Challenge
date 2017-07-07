
To start the server
docker-compose up -d

Use Postman to test.
localhost:3000/api/v1/doctors/search?name=david%20justice

If there is no exact match for the name, an API Call is made.  
If there is an exact match, but the document was retrieved more than one day ago, an API call is made.
If there is an exact match, and the document was retrived less than one day ago, use the local elastic db.
