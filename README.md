# Who Said What API


## Description

Who Said What is a template blog with different tiers of membership available for users. Higher membership levels correspond to greater privileges and more access. 

This repository is the backend which is served as a RESTful API for the frontends to consume. It is built with Express, using mongoose as an ODM for MongoDB, and passportJS to handle the authentication. Test suites are written with Jest and Supertest. 


### Membership tiers

* Guests: This is anyone who visits the page as a non-registered user. Guests can view all posts and comments, but cannot submit a comment and all comment authors are labelled as 'Anonymous'. 


* Regular: This is the lowest tier of membership and is satisfied through normal registration with username and password. Regular members can view posts, comments, and comment authors but cannot submit comments. 


* Privileged: Satisfaction of a privileged membership is through registration and the provision of a "privilege code" (which is "1234"). Privileged members can author comments and can see all posts, comments and their authors.


* Admin: This is the highest tier of membership and is satisfied through registration and the provision of an "admin code" (4321). Admin members can do everything privileged members can do, but they can also edit or delete other users' comments. Furthermore, they can author, edit and delete all posts, and they have access to posts which are yet to be
published. The exercise of some of these functions takes place at a dedicated frontend. 

### Frontends

Thare are two frontends for this project: 

* The main frontend
    * [Repository](https://www.github.com/rxthew/whosaidwhat) 
 
    * [Live Demo](https://rxthew.github.io/whosaidwhat)



* The admin frontend
    * [Repository](https://www.github.com/rxthew/whosaidwhatadmin) 
 
    * [Live Demo](https://rxthew.github.io/whosaidwhatadmin)


## Remarks 

### Objective

The goal of this project was to have a strict separation of concerns between my backend and my frontend. Serving my backend as a RESTful API using Express, the test was to be able to use it for multiple frontends (in fact both frontends are nearly identical).

Another important purpose for this project, was to be able to use authentication and to get my hands dirty with CORS, which ultimately proved to be the tougher task. This was
also the first time I tested my routes using supertest.

Having said that, I also used this opportunity to brush up on my React, particularly after the updates to their documentation, and to use Material UI as well. 

### Considerations

#### Initial API call 

The API is hosted using [render](https://render.com) using one of its free instances. The [docs suggest that when there is no inbound traffic for 15 minutes then the server is spun down](https://render.com/docs/free). This means that the initial request hangs for for about half a minute. If I were to seriously revisit this, that would have to be the first thing to change. 

#### Wholesale fetch

I do not anticipate any **actual** users to be using this product nor do I intend to write anything beyond sample posts, but in theory if there were a great volume of posts then the current implementation would be a problem, because all posts are fetched wholesale from the database. This would be too expensive and inefficient to justify, so if I do return to this, implementing pagination should be a task I would look to address. 


#### Features

The frontend lacks features. The comments section is not tailored for replies and creating and editing posts and comments is really limited. Implementing a rich text editor would be nice. I decided against implementing these features, because my goal was to craft the API and enable the authentication. It might be good in the future to come back to this and build on this structure, even if it is just to learn and grow.   


#### Hooks

When a user is deleted, all their comments, or their posts and comments should be deleted from the database as well. The same is true when a post is deleted, all its comments should delete as well. 

To perform this cascade delete operation, I wanted to use [mongoose's pre and post hooks](https://mongoosejs.com/docs/middleware.html). It seems like that's the standard and that makes sense because effectively the operation is performed as part of a chain of middleware functions that are defined before the model is compiled. I was eventually deterred from using hooks because I needed transactions to roll back if an error occured, it is possible to do this with hooks, but it introduces a layer of unnecessary complexity that is probably too much of a code smell for my liking.

It would have also meant rewriting all the controllers, because I was using Queries with the `deleteOne` and `deleteMany` methods, which require IDs to use, and retrieving those IDs to use those hooks was unworkable without patching everything together using either global variables or coupling modules together.

In the end, I still ended up implementing the operation but without hooks. I should like to keep this written down in case I need to review hooks in the future. The resource I used when making this decision is [in this Stackoverflow thread](https://stackoverflow.com/questions66276676mongoose-middleware-rollback-operations-performed-by-pre-post-hooks-when-an).
 

## Debugging Account

There was only one significant bug that I found to be truly frustrating before I discovered that it came from the library. The details for that can be found in this [issue](https://github.com/jdesboeufs/connect-mongo/issues/471), which I had opened.

The rest were the normal variety and were mostly to do with Jest, such as mocks not hoisting, not realising that I should not be testing compiled code, and innocuous misunderstandings, for example: at the outset, I was testing whether passport's `authenticate` method was being called, but then I realised that that approach was wrong, because that method generates a middleware so it was always called prior to the execution of the middleware chain, what I needed to do was to test whether the generated middleware was being called. 

I also struggled a bit with setting cookies and the cross-domain sharing aspect of it. A minor problem that cropped up in production was that I wanted the server to set the cookie if it came from a secure connection, but even though my frontend domain was using the secure protocol it kept getting rejected. I was confused about this, but going through render's docs gave me the reason: the server was using a reverse proxy which redirected the request using the regular HTTP protocol, so I had to take that into account when setting the cookie via express-session. 


    







