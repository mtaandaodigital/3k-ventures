# 3K Ventures Shopify Theme Development Guide

This guide provides instructions on how to set up and maintain your Shopify theme using Git for version control and how to deploy changes to your Shopify store.

## Table of Contents

1. [Initial Setup](#initial-setup)
   - [Git Setup](#git-setup)
   - [Shopify CLI Installation](#shopify-cli-installation)
   - [Connecting to Your Shopify Store](#connecting-to-your-shopify-store)
2. [Development Workflow](#development-workflow)
   - [Making Changes Locally](#making-changes-locally)
   - [Testing Your Changes](#testing-your-changes)
3. [Git Version Control](#git-version-control)
   - [Committing Changes](#committing-changes)
   - [Pushing to GitHub](#pushing-to-github)
4. [Deploying to Shopify](#deploying-to-shopify)
   - [Using Shopify CLI](#using-shopify-cli)
   - [Theme Publishing](#theme-publishing)
5. [Automating Deployments](#automating-deployments)
   - [GitHub Actions Setup](#github-actions-setup)
6. [Troubleshooting](#troubleshooting)

## Initial Setup

### Git Setup

1. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com) and sign in to your account
   - Click on "New" to create a new repository
   - Name your repository (e.g., "3k-ventures-shopify-theme")
   - Choose visibility (private recommended for commercial themes)
   - Click "Create repository"

2. **Initialize Git in Your Local Project**:
   ```bash
   # Navigate to your project directory
   cd c:/Users/proff/Documents/3k-ventures/3k-ventures

   # Initialize Git repository
   git init

   # Add the remote GitHub repository
   git remote add origin https://github.com/yourusername/your-repository-name.git
   ```

3. **Initial Commit**:
   ```bash
   # Add all files to staging
   git add .

   # Commit the files
   git commit -m "Initial commit"

   # Push to GitHub
   git push -u origin main
   ```

### Shopify CLI Installation

1. **Install Node.js and npm** (if not already installed):
   - Download and install from [nodejs.org](https://nodejs.org/)

2. **Install Shopify CLI**:
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

3. **Verify Installation**:
   ```bash
   shopify version
   ```

### Connecting to Your Shopify Store

1. **Log in to Shopify CLI**:
   ```bash
   shopify login
   ```

2. **Connect to Your Store**:
   ```bash
   shopify theme init
   ```
   Follow the prompts to connect to your store.

## Development Workflow

### Making Changes Locally

1. **Pull Latest Changes** (if working with a team):
   ```bash
   git pull origin main
   ```

2. **Make Your Changes** to theme files using your preferred code editor

3. **Preview Changes Locally**:
   ```bash
   shopify theme serve
   ```
   This will start a local development server that syncs with your Shopify store.

### Testing Your Changes

1. **Test on Different Devices** using the local development URL

2. **Check for Errors** in the browser console and Shopify CLI output

3. **Validate Liquid Syntax** to ensure there are no template errors

## Git Version Control

### Committing Changes

1. **Check Status** to see what files have changed:
   ```bash
   git status
   ```

2. **Add Changed Files** to staging:
   ```bash
   git add .
   ```
   Or add specific files:
   ```bash
   git add path/to/file
   ```

3. **Create .gitignore File** to exclude unnecessary files such as `node_modules`, `.DS_Store`, etc.
   ```bash
   touch .gitignore
   ```

   Add the files/folders you want to exclude to `.gitignore`. Example:
   ```
   node_modules/
   .DS_Store
   theme/assets/
   config/settings_data.json
   ```

4. **Commit Changes** with a descriptive message:
   ```bash
   git commit -m "Description of changes made"
   ```

### Pushing to GitHub

1. **Push Changes** to your GitHub repository:
   ```bash
   git push origin main
   ```

2. **Verify on GitHub** that your changes have been pushed successfully

## Deploying to Shopify

### Using Shopify CLI

1. **Deploy Theme Changes**:
   ```bash
   shopify theme push
   ```
   This will push all your local changes to your development theme.

2. **Specify a Theme** (optional):
   ```bash
   shopify theme push --theme=your-theme-id
   ```
   You can find your theme ID in the Shopify admin under Online Store > Themes.

### Theme Publishing

1. **Preview Before Publishing**:
   - Go to your Shopify admin
   - Navigate to Online Store > Themes
   - Find your development theme and click "Actions" > "Preview"

2. **Publish Your Theme**:
   - If you're satisfied with the changes, click "Actions" > "Publish"
   - Confirm that you want to make this your live theme

## Automating Deployments

### GitHub Actions Setup

You can automate the deployment process using GitHub Actions to automatically deploy your theme when you push to your repository.

1. **Create GitHub Actions Workflow File**:
   Create a file at `.github/workflows/shopify-deploy.yml` with the following content:

   ```yaml
   name: Shopify Theme Deployment

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '16'
         - name: Install Shopify CLI
           run: npm install -g @shopify/cli @shopify/theme
         - name: Deploy to Shopify
           run: |
             shopify login --store=${{ secrets.SHOPIFY_STORE }} --password=${{ secrets.SHOPIFY_PASSWORD }}
             shopify theme push
           env:
             SHOPIFY_FLAG_STORE: ${{ secrets.SHOPIFY_STORE }}
             SHOPIFY_CLI_THEME_TOKEN: ${{ secrets.SHOPIFY_CLI_THEME_TOKEN }}
   ```

2. **Set Up GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `SHOPIFY_STORE`: Your store's domain (e.g., your-store.myshopify.com)
     - `SHOPIFY_PASSWORD`: Your Shopify admin API password
     - `SHOPIFY_CLI_THEME_TOKEN`: Your theme access token

3. **Generate Theme Access Token**:
   - In your Shopify admin, go to Apps > Develop apps
   - Create a new app and configure the appropriate permissions
   - Generate and copy the theme access token

## Troubleshooting

### Common Issues

1. **Authentication Problems**:
   - Ensure your Shopify credentials are correct
   - Try logging out and logging back in with `shopify logout` and `shopify login`

2. **Push/Pull Conflicts**:
   - If you encounter Git conflicts, resolve them locally before pushing
   - Use `git pull` before making changes to ensure you have the latest code

3. **Theme Deployment Errors**:
   - Check for Liquid syntax errors in your theme files
   - Ensure you have the correct permissions for your Shopify store

### Getting Help

- Shopify CLI documentation: [Shopify Dev Docs](https://shopify.dev/themes/tools/cli)
- GitHub documentation: [GitHub Docs](https://docs.github.com)
- Shopify Community Forums: [Shopify Community](https://community.shopify.com)

---

This README provides a basic workflow for managing your Shopify theme with Git. Adjust the instructions as needed based on your specific requirements and team workflow.