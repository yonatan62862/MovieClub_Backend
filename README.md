Assignment1-Web-Development
Overview
This project is a collaborative assignment completed by Bar and Yonatan. We developed a REST API using Node.js, Express, and MongoDB to manage Posts and Comments. The focus is on team collaboration using Git with branches, pull requests, and code reviews.

Project Description
Posts API
Add a New Post

Method: POST
URL: /post
Description: Adds a new post to the database.
Get All Posts

Method: GET
URL: /post
Description: Retrieves all posts as a JSON array.
Get a Post by ID

Method: GET
URL: /post/<post_id>
Description: Retrieves a specific post by its ID.
Get Posts by Sender

Method: GET
URL: /post?sender=<sender_id>
Description: Retrieves posts by a specific sender.
Update a Post

Method: PUT
URL: /post/<post_id>
Description: Updates the content of a specific post.
Comments API
Add a New Comment

Method: POST
URL: /comment
Get All Comments

Method: GET
URL: /comment
Get Comments by Post ID

Method: GET
URL: /comment?post=<post_id>
Update a Comment

Method: PUT
URL: /comment/<comment_id>
Delete a Comment

Method: DELETE
URL: /comment/<comment_id>
Collaboration
We divided the work evenly, with each of us implementing half of the API endpoints. We used Git for version control and created separate branches for each feature. Pull requests were reviewed and approved before merging into the main branch.
