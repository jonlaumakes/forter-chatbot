1.  Setup elastic search container using the instructions for "Start a single-node cluster" steps 1-8
    https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html
2.  Set up .env file at project root with ELASTIC_PASSWORD=<password>
    (the password is generated in step 5)
3.  run client from /client: `npm run serve`
4.  run the server from /server: `npm run start:dev`

# Troubleshooting

- if you cannot connect to the server because a password issue, try pasting the password directly into the client config in server/src/handlers/question.js
