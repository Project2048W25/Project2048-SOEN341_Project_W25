import React from 'react';

export const Dashboard = () => {
    return (

    <div class="dashboard">
        <header class="dashboard-header">
            <h1>Dashboard</h1>
        </header>
        <nav class="dashboard-nav">
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#profile">Profile</a></li>
                <li><a href="#settings">Settings</a></li>
                <li><a href="#logout">Logout</a></li>
            </ul>
        </nav>
        <main class="dashboard-main">
            <section class="dashboard-section">
                <h2>Welcome to the Dashboard</h2>
                <p>This is a simple dashboard layout.</p>
            </section>
        </main>
        <footer class="dashboard-footer">
            <p>&copy; 2024 Your Company</p>
        </footer>
    </div>
);
};