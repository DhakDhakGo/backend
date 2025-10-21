# Data Models Summary

## 📦 Created Models

### **Post Service Models**

1. **BikeReview** (`services/post-service/src/models/BikeReview.js`)
   - Represents user reviews of bikes
   - Includes rating, categories, AI data
   - Tracks likes, comments, views

2. **OwnershipExperience** (`services/post-service/src/models/OwnershipExperience.js`)
   - Represents long-term ownership experiences
   - Includes cost breakdown, maintenance records
   - Tracks pros/cons, AI insights

3. **User** (`services/post-service/src/models/User.js`)
   - User profile information
   - Tracks user statistics (total posts, likes, etc.)

### **Interaction Service Models**

4. **Like** (`services/interaction-service/src/models/Like.js`)
   - Represents user likes on posts
   - Links user to post (review or experience)

5. **Comment** (`services/interaction-service/src/models/Comment.js`)
   - Represents user comments on posts
   - Can be edited and liked

## 🔗 Key Relationships

```
User
  └─ Creates ─┬─ BikeReview
              └─ OwnershipExperience

BikeReview/OwnershipExperience
  ├─ Has Many ─ Like
  └─ Has Many ─ Comment

Comment
  └─ Has Many ─ Like
```

## 📊 Firestore Collections

| Collection | Document ID | Purpose | Service |
|------------|-------------|---------|---------|
| `users` | Firebase UID | User profiles | Post Service |
| `bikeReviews` | Auto-generated | Bike reviews | Post Service |
| `ownershipExperiences` | Auto-generated | Ownership experiences | Post Service |
| `likes` | Auto-generated | User likes | Interaction Service |
| `comments` | Auto-generated | User comments | Interaction Service |

## 🔑 Key Features

### **BikeReview**
- ✅ Rating system (0-5)
- ✅ Category-based ratings
- ✅ AI-generated maintenance/repair costs
- ✅ Image attachments
- ✅ Tags for search
- ✅ Interaction counters

### **OwnershipExperience**
- ✅ Detailed cost breakdown
- ✅ Maintenance history
- ✅ Repair history
- ✅ Fuel efficiency tracking
- ✅ Pros and cons lists
- ✅ AI-generated insights

### **Like**
- ✅ One like per user per post
- ✅ Composite key validation
- ✅ Supports both post types

### **Comment**
- ✅ Rich text content
- ✅ Edit tracking
- ✅ Can be liked
- ✅ Character limit (5000)

## 🎯 Model Methods

Each model includes:

- **`toFirestore()`** - Convert to Firestore document
- **`fromFirestore(doc)`** - Create from Firestore document
- **`validate()`** - Data validation
- **Helper methods** - Business logic operations

## 🔐 Security Rules

Created `firestore.rules` with:
- User can only modify their own data
- Public posts readable by everyone
- Private posts only by owner
- Authenticated users can like/comment
- Users can only delete their own likes/comments

## 📈 Indexes

Created `firestore.indexes.json` with indexes for:
- Query by author + sort by date
- Query by bike name + filter by status
- Query likes by post + user (uniqueness)
- Query comments by post + sort by date

## 🚀 Next Steps

1. Deploy indexes to Firestore
2. Deploy security rules to Firestore
3. Implement service layer with CRUD operations
4. Add Firestore integration to services
5. Test the complete flow
