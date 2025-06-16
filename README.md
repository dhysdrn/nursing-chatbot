# Thee-AIdvisors

This should be a living document! If you encounter problems or missing instructions, please add them to this document in a PR.  
 
## Table of Contents

1. [About the Project](#about-the-project)
2. [Local Development](#local-development-environment-setup)
3. [Contributing to the Project](#contributing-to-the-project)
5. [Documentation](#documentation)

## About the Project

This repository holds the code written by the team Thee AIdvisors (Noah Lanctot, Lois Lanctot, Dhiyaa Nazim, Mason Sain, Abdul Rauoof) for Green River College's course SDEV 485 and 486 (Software Development Capstone 1 and 2) for Winter and Spring 2025.

**Tech stack**:

- [Node.js](https://nodejs.org/en): Backend (JS)
  - [Express.js](https://expressjs.com/): API routes
  - [nodemon](https://www.npmjs.com/package/nodemon): Auto restart node app
  - [dotenv](https://www.npmjs.com/package/dotenv): Load environment variables
  - [cors](https://www.npmjs.com/package/cors): Provides middleware
  - [node-nlp](https://www.npmjs.com/package/node-nlp): Provides translation from user text to responses
  - [Axios](https://www.npmjs.com/package/axios): Handles HTTP requests between the frontend and backend 
  - [OpenAI](https://www.npmjs.com/package/openai): Language model
  - [Cheerio](https://www.npmjs.com/package/cheerio): Parses and extracts content from HTML pages 
  - [pdf-parse](https://www.npmjs.com/package/pdf-parse): Extracts text content from PDF files 
  - [DataStax (Astra DB)](https://docs.datastax.com/en/astra-db-classic/index.html): Vector + document DB.
  - [fs (File System)](https://nodejs.org/api/fs.html#file-system) Reads and writes local files
  - [p-limit](https://www.npmjs.com/package/p-limit) Controls concurrency 
  - [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) Limits how frequently users can make requests 
  - [bcrypt](https://www.npmjs.com/package/bcrypt) Hashes passwords 
  - [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) Generates and verifies authentication tokens 
  - [node-cron](https://www.npmjs.com/package/node-cron) Schedules automated scraping tasks 
  - [langchain/text_splitter](https://www.npmjs.com/package/langchain) Splits large chunks of scraped text into manageable segments 
- [React.js](https://react.dev/): Frontend (UI components, JS, HTML, CSS)
  - [Vite](https://vite.dev/): frontend build tool

  

## Local Development Environment Setup

1. Clone the project repository locally.
   `git clone https://github.com/dhysdrn/nursing-chatbot.git`
2. Have the package manager `npm` installed ([npm](https://www.npmjs.com/)).
3. Create a .env file in the frontend with this variable: {VITE_FETCH_URL="http://localhost:5002/ask"}.
4. Create a .env file in the frontend with this variable using the OpenAI API key you generate: {AI_API_KEY=""}.
5. In the terminal/command line, navigate to the backend folder and install all backend dependencies with `npm install`.
6. Within the same backend folder, run the project with `node server.js`.
7. In the terminal/command line, navigate to the frontend folder and install all frontend dependencies with `npm install`.
8. Within the same frontend folder, run the project with `npm run dev`.
9. Once both the backend and frontend are running, you can access the full application by visiting the frontend URL

## Contributing to the Project

1. Pull the Latest Changes  
Before starting any work, ensure your local repository is up to date with the latest changes:
```sh
git checkout main  # Switch to the main branch
git pull origin main  # Pull the latest changes
```
2. Create a New Branch  
Create a new branch for your changes (choose a descriptive name):
```sh
git checkout -b your-branch-name
```
3. Install Dependencies  
If you haven't already installed the dependencies, do so now:
```sh
npm install
```
4. Make Your Changes  
Make the necessary changes in the codebase.
5. Commit Your Changes  
Commit your changes with a clear, descriptive message:
```sh
git commit -m "Describe your changes here"
```
6. Push Your Changes  
Push your changes to the repository:
```sh
git push origin your-branch-name
```
7. Submit a Pull Request
- Go to the original repository on GitHub.
- Click on Pull Requests and then New Pull Request.
- Select your branch and submit the request.
- Add a description of your changes and request a review from a team member.

#### Contribution Guidelines

- Ensure your code follows project standards and is well-documented.
- Test your changes before submitting a pull request.
- Practice submitting pull requests and avoid committing directly to the main branch to prevent conflicts.


## Documentation
### Project Structure

```sh
thee-aidvisors/
│-- backend/    # Node.js backend
│-- frontend/   # React Vite frontend
│-- README.md   # Project documentation
```

