# ecom-project

## Deployed version admin login

Admin login info: \
Username: admin \
Password: admin-admin123

## Local Setup

This project consists of a Django backend and a React frontend. Follow the instructions below to set up and run both parts of the application locally.

## Backend Setup

1. Navigate to the root directory of the project.

2. Create a virtual environment:

    ```
    python3 -m venv venv
    ```

3. Activate the virtual environment:

    ```
    source venv/bin/activate
    ```

4. Install the required packages:

    ```
    pip install -r ./backend/requirements.txt
    ```

5. Navigate to the backend directory:

    ```
    cd backend
    ```

6. For first-time setup, run migrations:
    ```
    python manage.py migrate
    ```
7. For first-time setup, run collectstaic:
    ```
    python manage.py collectstatic
    ```
8. If you want to have an admin account run createsuperuser:
    ```
    python manage.py createsuperuser
    ```
9. Start the Django development server:
    ```
    python manage.py runserver
    ```

The backend should now be running at `http://localhost:8000`.
The admin dashboard can be found at `http://localhost:8000/admin`.

## Frontend Setup

1. From the root directory, navigate to the frontend directory:

    ```
    cd frontend
    ```

2. Install the necessary npm packages:

    ```
    npm install
    ```

3. Start the React development server:
    ```
    npm run start
    ```

The frontend should now be running at `http://localhost:3000`.

## Additional Notes

-   Ensure you have Python and Node.js installed on your system before starting.
-   The backend and frontend should be run in separate terminal windows.
