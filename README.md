# DineBook

# CSCI5709 - Adv. Topics in Web Development - Summer 2025

# Group 05

## Feature: Review System API

Review System APIs allows customers to manage their restaurant reviews and restaurant owners to manage replies. All endpoints are prefixed with `/api/reviews/`.

### Customer-Specific Endpoints

These endpoints require authentication with a `customer` role and a valid JWT token in the `Authorization` header.

#### 1. Create a Review

- **Method**: `POST`
- **Endpoint**: `/api/reviews/`
- **Description**: Create a new review for a restaurant (one review per customer per restaurant).
- **Request Body**:
  ```json
  {
    "restaurantId": "string", // Restaurant ID
    "rating": 4, // Rating (1-5)
    "comment": "string" // Review comment
  }
  ```
- **Response**:
  - `201 Created`: Review created.
  - `400 Bad Request`: Invalid input or duplicate review.
  - `404 Not Found`: Restaurant not found or inactive.

#### 2. Update a Review

- **Method**: `PUT`
- **Endpoint**: `/api/reviews/:id`
- **Description**: Update an existing review owned by the customer.
- **Request Body**:
  ```json
  {
    "rating": 3, // Optional: New rating (1-5)
    "comment": "string" // Optional: Updated comment
  }
  ```
- **Response**:
  - `200 OK`: Review updated.
  - `400 Bad Request`: Invalid input.
  - `404 Not Found`: Review not found or permission denied.

#### 3. Delete a Review

- **Method**: `DELETE`
- **Endpoint**: `/api/reviews/:id`
- **Description**: Delete a customer's own review.
- **Response**:
  - `200 OK`: Review deleted.
  - `404 Not Found`: Review not found or permission denied.

#### 4. Get My Reviews

- **Method**: `GET`
- **Endpoint**: `/api/reviews/my-reviews`
- **Description**: Retrieve all reviews by the authenticated customer.
- **Response**:
  - `200 OK`: List of customer's reviews.
  - `403 Forbidden`: Non-customer access.

### Public Endpoint

No authentication required.

#### 1. Get Reviews by Restaurant

- **Method**: `GET`
- **Endpoint**: `/api/reviews/restaurant/:restaurantId`
- **Description**: Retrieve all reviews for a specific restaurant.
- **Response**:
  - `200 OK`: List of reviews.
  - `404 Not Found`: Restaurant not found or inactive.

### Owner-Specific Endpoints

These endpoints require authentication with an `owner` role and a valid JWT token in the `Authorization` header.

#### 1. Reply to a Review

- **Method**: `POST`
- **Endpoint**: `/api/reviews/:id/reply`
- **Description**: Add a reply to a review for the owner's restaurant.
- **Request Body**:
  ```json
  {
    "reply": "string" // Owner's reply
  }
  ```
- **Response**:
  - `200 OK`: Reply added.
  - `400 Bad Request`: Invalid input.
  - `403 Forbidden`: Not the restaurant owner.
  - `404 Not Found`: Review not found.

#### 2. Update Reply

- **Method**: `PUT`
- **Endpoint**: `/api/reviews/:id/reply`
- **Description**: Update an existing reply by the restaurant owner.
- **Request Body**:
  ```json
  {
    "reply": "string" // Updated reply
  }
  ```
- **Response**:
  - `200 OK`: Reply updated.
  - `400 Bad Request`: Invalid input.
  - `403 Forbidden`: Not the restaurant owner.
  - `404 Not Found`: Review not found.

### 3. Delete Reply

- **Method**: `DELETE`
- **Endpoint**: `/api/reviews/:id/reply`
- **Description**: Delete an owner's reply to a review.
- **Response**:
  - `200 OK`: Reply deleted.
  - `403 Forbidden`: Not the restaurant owner.
  - `404 Not Found`: Review not found.

### Notes

- Customers can only manage their own reviews.
- Owners can only reply to reviews for their restaurants.
- Average ratings are updated automatically after review changes.
