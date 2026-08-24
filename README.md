# SocialPilot

SocialPilot is a social media scheduling and campaign management platform
designed to support multiple user roles and workflows.

This project was rebuilt from scratch as the final SocialPilot implementation
for the Infosys Springboard internship project.

## Project Structure

```text
socialpilot/
├── frontend/        # Next.js frontend application
├── backend/         # Backend workspace
└── README.md

Technologies Used
Next.js
React
TypeScript
Tailwind CSS
Zustand
Zod
Next.js App Router
User Roles

SocialPilot provides role-specific experiences for four primary user roles:

Administrator

The Administrator workspace includes:

Dashboard
User Management
Team Management
Platform Analytics
Notifications
Platform Settings
Account Settings
Profile
Business Owner

The Business Owner workspace includes:

Dashboard
Connected Accounts
Campaigns
Scheduled Posts
Published Posts
Publishing Logs
Analytics
Reports
Notifications
Profile
Settings
Marketing Team

The Marketing Team workspace includes:

Dashboard
Client Management
Client Workspaces
Campaign Management
Content Scheduling
Publishing Calendar
Analytics
Reports
Notifications
Profile
Settings

Marketing Team members can access individual client workspaces and manage
content and campaign-related workflows for those clients.

Content Creator

The Content Creator workspace includes:

Dashboard
Connected Accounts
My Posts
Post Creation
Post Editing
Draft Management
Post Queue
Publishing Logs
Campaigns
Calendar
Notifications
Profile
Settings
Authentication and Role-Based Navigation

The application includes dedicated authentication pages for:

Login
Registration

After authentication, users are directed to the appropriate workspace
according to their assigned role.

The frontend separates authentication routes from the main dashboard
application and provides role-specific navigation and layouts.

Major Features
Social Account Management

The application provides interfaces for connecting and managing social media
accounts for the relevant user workflows.

Content Management

Content Creator and Marketing Team workflows include:

Creating posts
Editing posts
Draft management
Post queues
Publishing logs
Post status management
Calendar-based content management
Campaign Management

The application provides campaign management interfaces for creating and
managing social media campaigns.

Scheduling and Publishing

SocialPilot includes interfaces for:

Scheduling posts
Publishing calendars
Scheduled posts
Published posts
Publishing logs
Publish-now workflows
Analytics and Reporting

Role-specific dashboards provide analytics and reporting interfaces for
monitoring platform, campaign, and social media activity.

Notifications

The application includes notification centers and notification settings
for relevant user workflows.

Profiles and Settings

Users have role-specific profile and settings pages for managing their
application preferences and account information.

Frontend Architecture

The frontend uses the Next.js App Router and is organized into authentication,
marketing, and dashboard route groups.
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   │
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   └── (dashboard)/
│       ├── administrator/
│       ├── business-owner/
│       ├── content-creator/
│       ├── marketing-team/
│       ├── dashboard/
│       └── layout.tsx
│
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── landing/
│   └── layout/
│
├── hooks/
├── lib/
├── store/
└── types/

This structure keeps role-specific functionality separated while allowing
shared components and utilities to be reused across the application.

State Management

Client-side application state is managed using Zustand stores.

The frontend contains stores covering areas such as:

Authentication
Social accounts
Campaigns
Notifications
Posts
Profiles
Platform settings
Team assignments
Administrator users
Landing Page

The application includes a marketing landing page containing:

Hero section
Product overview
Platform information
Workflow/pipeline presentation
Pricing section
Final call-to-action
Design System

The application follows a yellow, black, white, and gray visual design
system.

Role	Hex
Ink	#141414
Muted	#6B6B6B
Border	#D9D9D6
Background	#F5F5F3
Surface	#FFFFFF
Accent	#F4C430
Accent Hover	#D9A80A

The design system is centralized through the frontend styling system to
maintain consistency across the application.

API and Backend Integration

The frontend contains a centralized API layer for communication with the
backend.

Backend-dependent functionality is structured so that API communication and
client-side state can be maintained separately from the presentation layer.

The backend directory is maintained separately from the frontend so that
the two layers can be integrated without coupling backend implementation
details directly into individual UI components.

Environment Setup

Navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

If an environment example file is provided, create the local environment
file:

cp .env.local.example .env.local

Configure the required environment variables according to the backend
environment.

Do not commit private credentials, tokens, passwords, or local environment
files to the repository.

Running the Application

Start the development server:

cd frontend
npm run dev

The application will normally be available at:

http://localhost:3000
Production Build

To create a production build:

cd frontend
npm run build

To start the production application:

npm start
Current Project Status

The current implementation represents the final rebuilt SocialPilot frontend.

Completed
 Marketing landing page
 Login
 Registration
 Authentication structure
 Role-based navigation
 Administrator workspace
 Business Owner workspace
 Marketing Team workspace
 Content Creator workspace
 Client workspace structure
 Social account management UI
 Content creation workflows
 Draft management
 Post queue
 Publishing workflows
 Publishing calendar
 Campaign management
 Analytics interfaces
 Reporting interfaces
 Notifications
 Profile management
 Settings
 Zustand state management
 Shared frontend architecture
Project Rebuild

The current project was rebuilt from scratch after the earlier project
implementation was discontinued.

The rebuilt implementation reorganizes the application around the final
project requirements, with separate role-based workspaces and reusable
frontend components.

Repository Branch

The final frontend implementation contributed for this branch is maintained
on:

pranjal-socialpilot

This branch contains the current final SocialPilot implementation for the
contribution.

License

MIT License.


### 4. Then click **Preview**

Look through it quickly. You should see proper headings, tables, bullet points, and code blocks.

### 5. Click **Commit changes...**

In the commit dialog, use:

**Commit message:**

```text
Update README for final SocialPilot implementation

