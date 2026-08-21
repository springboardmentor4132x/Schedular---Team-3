
# SocialPilot – Social Media Management Platform

SocialPilot is a full-stack social media management platform that helps teams plan content, manage campaigns, connect social accounts, schedule and publish posts, monitor analytics, and generate reports from a single workspace.

## My Contribution

My primary contribution focused on building and improving the backend architecture, APIs, database design, scheduling workflow, security, and integrations. I also made frontend improvements to ensure the user interface works smoothly with the backend and supports role-based workspaces.

---

## Backend Development

### Backend Architecture

The backend is built with **FastAPI** and **PostgreSQL**, using **SQLAlchemy** for database operations and **Alembic** for version-controlled database migrations. The project follows a modular structure with separate layers for:

- API routes
- Database models
- Pydantic schemas
- Business services
- Authentication and authorization utilities
- Background tasks
- Social media integrations

This structure makes the application easier to maintain, extend, and test.

### Authentication and Security

Implemented a secure authentication system with:

- User registration and login APIs
- Password hashing using `bcrypt`
- JWT-based access tokens
- Token validation for protected routes
- Password change support
- Logout and token refresh endpoints
- Active/inactive user validation
- Encrypted storage of social-media OAuth access and refresh tokens using Fernet encryption

### Role-Based Access Control

Implemented role-based access control to ensure users can access only the features and data relevant to their role.

Supported roles include:

- Administrator
- Business User / Business Owner
- Marketing Team
- Content Creator

Role validation is applied through reusable dependency functions and role-checking utilities. This improves security by restricting sensitive actions such as user management, business assignment, campaign access, and administrative analytics.

### Business and Team Management

Added backend functionality for managing the relationship between businesses and marketing teams.

Key features include:

- Assigning business users to marketing teams
- Viewing marketing-team assignments
- Viewing assigned client businesses
- Removing assignments when required
- Scoping data access so users only see authorized businesses, campaigns, posts, and analytics
- APIs for administrators to manage users, teams, and business relationships

### Content Scheduling and Publishing

Developed a complete post-management workflow for social-media content.

Features include:

- Create, update, retrieve, and delete scheduled posts
- Draft, scheduled, published, and failed post statuses
- Calendar-based post retrieval
- Campaign association for scheduled posts
- Media upload support for images and videos
- Publishing logs for tracking each publishing attempt
- Manual “publish now” endpoint
- Retry endpoint for failed publishing attempts
- Publish-status tracking and failure handling
- Support for recurring posts with configurable recurrence options

### Background Processing with Celery and Redis

Integrated **Celery** and **Redis** to process publishing and scheduled tasks asynchronously.

Background task capabilities include:

- Publishing scheduled posts at the required time
- Retrying temporary publishing failures
- Avoiding unnecessary retries for permanent failures
- Processing recurring posts and creating the next scheduled instance
- Refreshing expiring social-media tokens
- Updating queue and post statuses during publishing

This prevents long-running publishing operations from blocking the main API server.

### Social Media Integrations

Created the foundation for connecting and publishing to multiple social platforms.

Supported integration areas include:

- Instagram
- Facebook
- LinkedIn
- X (Twitter)
- YouTube

Implemented functionality includes:

- Social-account connection and management
- OAuth callback handling
- Secure token storage
- Token-expiry handling and automatic refresh support
- Platform-specific publishing logic
- Instagram image and reel publishing support
- Platform account status and connection management

### Campaign Management

Built APIs for campaign lifecycle management.

Features include:

- Create, update, view, and delete campaigns
- Campaign status updates
- Campaign performance metrics
- Campaign analytics endpoints
- Viewing posts associated with a campaign
- Marketing-team ownership and business-level scoping

### Analytics Module

Developed analytics APIs to provide meaningful social-media and campaign insights.

The analytics system supports:

- Overall dashboard metrics
- Audience analytics
- Platform-wise performance comparison
- Post-level performance metrics
- Top-performing and lowest-performing posts
- Campaign analytics
- Engagement trends
- Analytics summary endpoints
- Mock-data seeding for development and demonstration

### Notifications

Implemented an in-app notification system for important events.

Notification features include:

- Publishing success and failure notifications
- Account reconnection and token-expiry alerts
- Notification history
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications
- Notification preferences
- Email notification preferences

### Reports

Implemented report-generation and report-management APIs.

Features include:

- Generate analytics reports
- Preview reports before download
- Download generated reports
- View report history
- Delete generated reports
- Store generated-report metadata in the database

### Database Design and Migrations

Created and extended database models for core platform features, including:

- Users
- Social accounts
- Scheduled posts
- Campaigns
- Post media
- Publish logs
- Notifications
- Notification preferences
- Business assignments
- Generated reports
- Post analytics
- Audience analytics
- Campaign analytics snapshots
- Platform analytics

Alembic migrations are used to safely evolve the database schema as new modules and fields are introduced.

---

## Frontend Improvements

The frontend is built with **Next.js, React, TypeScript, Tailwind CSS, Zustand, and Recharts**.

### Role-Specific Workspaces

Improved the frontend to support dedicated workspaces for different user roles:

- Administrator dashboard
- Business Owner dashboard
- Marketing Team workspace
- Content Creator workspace

Each workspace provides navigation, pages, and data views based on the user’s permissions and responsibilities.

### Marketing Team and Client Management

Added frontend pages and flows for marketing teams to:

- View assigned clients
- Access client-specific workspaces
- Manage client content
- View client campaigns
- Access client analytics
- Manage client reports
- View connected accounts and publishing activity

### Content and Publishing Interface

Improved the content workflow with UI pages for:

- Creating posts
- Editing posts
- Managing drafts
- Viewing scheduled content
- Calendar-based publishing view
- Queue management
- Publishing logs
- Publish-now actions
- Media uploads and post previews

### Campaign Interface

Added and improved campaign management screens for:

- Campaign dashboard
- Campaign creation and editing
- Campaign details
- Campaign timeline
- Campaign analytics
- Campaign-related posts
- Campaign status indicators and statistics

### Analytics and Reporting UI

Created dashboard components and pages for:

- Performance trends
- Platform comparison
- Audience analytics
- Content analytics
- Campaign analytics
- Analytics filters
- Report generation
- Report previews
- Report history
- Download center

### User Experience Improvements

Other frontend improvements include:

- Protected routes using authentication checks
- Shared dashboard layouts, sidebars, and top navigation
- Responsive dashboard components
- Status badges for posts and campaigns
- Notification center and notification settings
- Profile and security settings
- Account connection cards for social platforms
- Centralized state management using Zustand stores
- Typed frontend models and API type-generation support

---

## Technology Stack

### Backend

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- JWT
- bcrypt
- Fernet encryption
- Celery
- Redis
- Uvicorn

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand
- React Hook Form
- Zod
- Recharts
- Framer Motion

---

## Key Outcome

The project has evolved from a basic social-media scheduling application into a role-based platform with secure authentication, business-team collaboration, social-account management, media handling, asynchronous publishing, analytics, notifications, reports, and dedicated dashboards for each user type.
```
