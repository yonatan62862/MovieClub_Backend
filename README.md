Assignment1-Web-Development

Overview

This project is a collaborative assignment completed by Bar and Yonatan. We developed a REST API using Node.js, Express, and MongoDB to manage Posts and Comments. The focus is on team collaboration using Git, with branches, pull requests, and code reviews.

Project Description
Posts API
1. Add a New Post
Method: POST
URL: /post
Description: Adds a new post to the database.

2. Get All Posts
Method: GET
URL: /post
Description: Retrieves all posts as a JSON array.

3. Get a Post by ID
Method: GET
URL: /post/<post_id>
Description: Retrieves a specific post by its ID.

4. Get Posts by Sender
Method: GET
URL: /post?sender=<sender_id>
Description: Retrieves posts by a specific sender.

5. Update a Post
Method: PUT
URL: /post/<post_id>
Description: Updates the content of a specific post.

Comments API

1. Add a New Comment
Method: POST
URL: /comment
Description: Adds a new comment to the database.

2. Get All Comments
Method: GET
URL: /comment
Description: Retrieves all comments.

3. Get Comments by Post ID
Method: GET
URL: /comment?post=<post_id>
Description: Retrieves comments for a specific post.

4. Update a Comment
Method: PUT
URL: /comment/<comment_id>
Description: Updates the content of a specific comment.

5. Delete a Comment
Method: DELETE
URL: /comment/<comment_id>
Description: Deletes a specific comment.

Collaboration

We divided the work evenly, with each of us implementing half of the API endpoints. We used Git for version control, creating separate branches for each feature. Pull requests were reviewed and approved before merging into the main branch.
