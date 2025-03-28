# icdb
icdb

icdb/ ├── index.html # Homepage 
├── recipe-detail.html # etc... (HTML pages for each entity type) 
├── chef-detail.html ├── ingredient-detail.html 
├── technique-detail.html 
├── cuisine-detail.html 
├── cookbook-detail.html 
├── show-detail.html 
├── equipment-detail.html 
├── search-results.html 
├── profile.html 
├── settings.html 
├── submit-recipe.html 
├── forums.html 
├── shopping-list.html 
├── login.html 
├── register.html 
│ ├── css/ 
│ ├── style.css # Main theme, base styles, variables 
│ ├── layout.css # Grid, flexbox, container, major page layouts 
│ ├── components.css # Cards, buttons, forms, tabs, lists, etc. 
│ ├── responsive.css # Media queries for screen size adjustments 
│ └── print.css # Print-specific styles 
│ ├── js/ 
│ ├── main.js # Global initializations, header/nav logic 
│ ├── auth.js # Login/Register form handling (simulated) 
│ ├── recipe.js # Recipe scaling, timers, interactions 
│ ├── reviews.js # Review submission, voting, reporting 
│ ├── lists.js # Cooklist/Shopping List management 
│ ├── search.js # Search results filtering/sorting/pagination 
│ ├── profile.js # Profile page logic (follow, etc.) 
│ ├── settings.js # Settings page form handling 
│ ├── submit-recipe.js # Dynamic recipe submission form 
│ ├── technique.js # Technique page interactions (voting) 
│ ├── equipment.js # Equipment page interactions 
│ ├── cookbook.js # Cookbook page interactions 
│ ├── show.js # Show page interactions 
│ ├── components/ # JS for reusable components 
│ │ ├── modal.js # Modal dialog logic 
│ │ └── tabs.js # Tab interface logic 
│ └── vendor/ # Third-party libraries (if any) 
│ ├── images/ 
│ ├── logo.svg # Changed to SVG 
│ ├── placeholder/ # Placeholder images for development 
│ └── icons/ # UI Icons (SVG preferred) 
│ ├── star-filled.svg 
│ ├── star-empty.svg 
│ ├── star-half.svg # (Need to create) 
│ ├── add-to-list.svg 
│ ├── share.svg # (Choose one style) 
│ └── ... (search, delete, edit, check, close, etc.) 
│ ├── partials/ # Conceptual: Reusable HTML snippets (header, footer, cards) 
│ ├── header.html 
│ ├── footer.html 
│ ├── recipe-card.html 
│ ├── review-card.html 
│ ├── rating-stars.html 
│ └── sidebar.html 
│ ├── README.md # This file 
└── LICENSE # Project License (Add your chosen license file - e.g. LICENSE.md)
## Setup & Running (Static Prototype)

1.  **Clone the repository:**
    ```bash
    git clone [[YOUR_REPOSITORY_URL]](https://github.com/AshishGautamKarn/icdb.git) icdb
    cd flavor-db
    ```
2.  **(Manual Step for Static):** Copy the contents of `partials/header.html` and `partials/footer.html` into the respective `<header>` and `<footer>` sections of each main `.html` file (e.g., `index.html`, `recipe-detail.html`).
3.  **Obtain Assets:**
    *   Make sure the `logo.svg` file is in `images/`.
    *   Place all required `.svg` icon files (like `star-filled.svg`, etc.) into `images/icons/`.
    *   Add placeholder or actual `.jpg` image files into `images/placeholder/` or other relevant directories as referenced in the HTML.
4.  **Open in Browser:** Open the `index.html` file (or any other main `.html` file) directly in your web browser.

**Note:** This static version provides a visual representation of the site structure and basic UI interactions. Features requiring a backend (user accounts, saving data, dynamic content loading, searching, submitting forms) are simulated or non-functional.

## Running (Conceptual Full Stack)

To run a full version of this application (requires backend implementation):

1.  **Backend Setup:** Set up the chosen backend framework, install dependencies (`pip install -r requirements.txt`, `npm install`, etc.).
2.  **Database:** Configure database connection, run migrations to create tables.
3.  **Dependencies:** Install any front-end build tools or libraries if used (e.g., `npm install`).
4.  **Environment Variables:** Configure necessary environment variables (database credentials, API keys, secret keys).
5.  **Build (If Applicable):** Run any necessary front-end build steps (`npm run build`). Use a build tool to handle partial includes.
6.  **Run Server:** Start the backend development server (e.g., `python manage.py runserver`, `npm start`).
7.  Access the application via the local URL provided by the server (e.g., `http://localhost:8000` or `http://localhost:3000`).

## Development Notes

*   Code includes extensive structure comments for clarity.
*   HTML aims for semantic correctness and includes basic ARIA roles/attributes for accessibility.
*   CSS follows Material Design principles and is organized modularly.
*   JavaScript uses modern ES6+ features and is separated by functionality.

## Future Development / Roadmap

*   Implement backend API and database interactions.
*   Complete user authentication and authorization flow.
*   Implement dynamic loading of all content (recipes, reviews, etc.).
*   Build out forum functionality (topic creation, posting).
*   Develop user recipe submission workflow with moderation.
*   Implement full gamification logic (points, badge awarding).
*   Integrate "My Pantry" and "My Kitchen Tools" features.
*   Develop API integrations (e.g., grocery delivery).
*   Build dedicated mobile application (iOS/Android).
*   Refine search functionality with a dedicated engine (Elasticsearch).
*   Add robust accessibility testing and improvements.

## Contributing

Contributions are welcome! Please follow these general steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name` or `bugfix/issue-description`).
3.  Make your changes, adhering to the project's coding style.
4.  Commit your changes with descriptive commit messages.
5.  Push your branch to your fork (`git push origin feature/your-feature-name`).
6.  Create a Pull Request against the main repository's `main` or `develop` branch.
