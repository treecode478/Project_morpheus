# API Documentation

**Last generated:** 2026-02-18T10:08:34.654Z

## Base URL
- `http://localhost:5000/api/v1`

## Route prefixes (from backend `src/app.js`)
| module | prefix | file |
| --- | --- | --- |
| weather | /api/v1/weather | `krishiconnect-backend/src/modules/weather/weather.routes.js` |
| user | /api/v1/users | `krishiconnect-backend/src/modules/user/user.routes.js` |
| qa | /api/v1/qa | `krishiconnect-backend/src/modules/qa/qa.routes.js` |
| post | /api/v1/posts | `krishiconnect-backend/src/modules/post/post.routes.js` |
| notification | /api/v1/notifications | `krishiconnect-backend/src/modules/notification/notification.routes.js` |
| market | /api/v1/market | `krishiconnect-backend/src/modules/market/market.routes.js` |
| chat | /api/v1/chat | `krishiconnect-backend/src/modules/chat/chat.routes.js` |
| auth | /api/v1/auth | `krishiconnect-backend/src/modules/auth/auth.routes.js` |


## Endpoints (parsed from `*.routes.js`)
### auth (`/api/v1/auth`)

| method | path | handlers |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | `registerLimiter, validate(registerSchema), authController.register` |
| POST | `/api/v1/auth/verify-otp` | `validate(verifyOTPSchema), authController.verifyOTP` |
| POST | `/api/v1/auth/verify-registration-otp` | `validate(verifyRegistrationOTPSchema), authController.verifyRegistrationOTP` |
| POST | `/api/v1/auth/login` | `validate(loginSchema), authController.login` |
| POST | `/api/v1/auth/refresh-token` | `validate(refreshTokenSchema), authController.refreshToken` |
| POST | `/api/v1/auth/logout` | `authenticate, authController.logout` |
| POST | `/api/v1/auth/forgot-password` | `forgotPasswordLimiter, validate(forgotPasswordEmailSchema), authController.forgotPassword` |
| POST | `/api/v1/auth/reset-password` | `validate(resetPasswordWithOTPSchema), authController.resetPasswordWithOTP` |
| POST | `/api/v1/auth/resend-otp` | `validate(resendOTPSchema), authController.resendOTP` |


### chat (`/api/v1/chat`)

| method | path | handlers |
| --- | --- | --- |
| POST | `/api/v1/chat/conversations` | `validate(createConversationSchema), chatController.createConversation` |
| GET | `/api/v1/chat/conversations` | `chatController.getConversations` |
| GET | `/api/v1/chat/conversations/:conversationId/messages` | `chatController.getMessages` |


### market (`/api/v1/market`)

| method | path | handlers |
| --- | --- | --- |
| GET | `/api/v1/market/prices` | `marketController.getPrices` |
| GET | `/api/v1/market/commodities` | `marketController.getCommodities` |
| GET | `/api/v1/market/states` | `marketController.getStates` |


### notification (`/api/v1/notifications`)

| method | path | handlers |
| --- | --- | --- |
| GET | `/api/v1/notifications/` | `notificationController.getNotifications` |
| GET | `/api/v1/notifications/unread-count` | `notificationController.getUnreadCount` |
| PATCH | `/api/v1/notifications/read-all` | `notificationController.markAllAsRead` |
| PATCH | `/api/v1/notifications/:notificationId/read` | `notificationController.markAsRead` |


### post (`/api/v1/posts`)

| method | path | handlers |
| --- | --- | --- |
| POST | `/api/v1/posts/` | `authenticate, validate(createPostSchema), postController.createPost` |
| GET | `/api/v1/posts/` | `authenticate, postController.getFeed` |
| GET | `/api/v1/posts/user/:userId` | `optionalAuth, postController.getUserPosts` |
| GET | `/api/v1/posts/hashtag/:tag` | `optionalAuth, postController.getPostsByHashtag` |
| GET | `/api/v1/posts/:postId` | `optionalAuth, postController.getPostById` |
| PATCH | `/api/v1/posts/:postId` | `authenticate, validate(updatePostSchema), postController.updatePost` |
| DELETE | `/api/v1/posts/:postId` | `authenticate, postController.deletePost` |
| POST | `/api/v1/posts/:postId/like` | `authenticate, postController.likePost` |
| DELETE | `/api/v1/posts/:postId/like` | `authenticate, postController.unlikePost` |
| POST | `/api/v1/posts/:postId/comments` | `authenticate, validate(commentSchema), postController.addComment` |
| GET | `/api/v1/posts/:postId/comments` | `postController.getComments` |


### qa (`/api/v1/qa`)

| method | path | handlers |
| --- | --- | --- |
| POST | `/api/v1/qa/questions` | `authenticate, qaController.createQuestion` |
| GET | `/api/v1/qa/questions` | `qaController.getQuestions` |
| GET | `/api/v1/qa/questions/:questionId` | `qaController.getQuestionById` |
| POST | `/api/v1/qa/questions/:questionId/answers` | `authenticate, qaController.addAnswer` |
| GET | `/api/v1/qa/questions/:questionId/answers` | `qaController.getAnswers` |


### user (`/api/v1/users`)

| method | path | handlers |
| --- | --- | --- |
| GET | `/api/v1/users/me` | `userController.getMe` |
| PATCH | `/api/v1/users/me` | `userController.updateMe` |
| POST | `/api/v1/users/me/avatar` | `uploadSingle('avatar'), async (req, res, next) => { if (req.file) { try { req.uploadResult = await uploadToCloudinary(req.file.buffer, { folder: 'krishiconnect/avatars', }` |
| GET | `/api/v1/users/search` | `userController.searchUsers` |
| GET | `/api/v1/users/:userId` | `userController.getUserById` |
| POST | `/api/v1/users/:userId/follow` | `userController.followUser` |
| DELETE | `/api/v1/users/:userId/follow` | `userController.unfollowUser` |
| GET | `/api/v1/users/:userId/followers` | `userController.getFollowers` |
| GET | `/api/v1/users/:userId/following` | `userController.getFollowing` |


### weather (`/api/v1/weather`)

| method | path | handlers |
| --- | --- | --- |
| GET | `/api/v1/weather/current` | `weatherController.getCurrentWeather` |



## Response envelope
```json
{
  "success": true,
  "statusCode": 200,
  "message": "string",
  "data": {},
  "meta": {},
  "timestamp": "ISO-8601"
}
```
