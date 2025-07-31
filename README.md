TUGON

Welcome to the repository!

This guide will walk you through the process of setting up the project locally, starting development, and properly handling Git branches and commits.

🛠 Prerequisites
Before cloning this repository, make sure you have the following installed:


- [Node.js](https://nodejs.org/) (LTS recommended)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (or any code editor of your choice)

VS Code (or any code editor of your choice)

🚀 Getting Started

Follow these steps to run the project locally:

Clone the repository
Open your terminal and run:
git clone https://github.com/mrvnhwl/TugonV2.git

Navigate to the project folder
cd TugonV2

Open the project in VS Code
code .

Install the dependencies
npm install

Start the development server
npm run dev

🧑‍💻 Start Coding

Before you begin coding, create a branch first based on your assigned task.
Example:
git checkout -b login/usertype_selection

✅ After Coding

Stage your changes:
git add .

Check the status of your changes:
git status

Commit your changes:

git commit -m "Update Login Page"

Push your branch:

If you created the branch:

git push login/usertype_selection

If the branch already exists remotely:

git push login/usertype_selection


✅ ALWAYS PULL FIRST FOR THE UPDATES IN THE REPO

git checkout main


git pull origin main



🔁 MUST DO

After pushing your changes, return to the main branch:
git checkout main
