# Database Schema (MongoDB / Mongoose)

**Last generated:** 2026-02-18T10:08:34.654Z

## Connection
- `mongodb://localhost:27017/krishiconnect`

## Collections / Models
| model | file |
| --- | --- |
| `weather` | `krishiconnect-backend/src/modules/weather/weather.model.js` |
| `follow` | `krishiconnect-backend/src/modules/user/follow.model.js` |
| `user` | `krishiconnect-backend/src/modules/user/user.model.js` |
| `answer` | `krishiconnect-backend/src/modules/qa/models/answer.model.js` |
| `question` | `krishiconnect-backend/src/modules/qa/models/question.model.js` |
| `comment` | `krishiconnect-backend/src/modules/post/models/comment.model.js` |
| `like` | `krishiconnect-backend/src/modules/post/models/like.model.js` |
| `post` | `krishiconnect-backend/src/modules/post/models/post.model.js` |
| `notification` | `krishiconnect-backend/src/modules/notification/notification.model.js` |
| `market` | `krishiconnect-backend/src/modules/market/market.model.js` |
| `conversation` | `krishiconnect-backend/src/modules/chat/models/conversation.model.js` |
| `message` | `krishiconnect-backend/src/modules/chat/models/message.model.js` |
| `otp` | `krishiconnect-backend/src/modules/auth/otp.model.js` |


## OTP storage
- Phone OTP: Redis keys like `otp:<phoneNumber>`
- Email OTP: MongoDB collection `otps`
