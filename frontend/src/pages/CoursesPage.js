// CoursesPage.js
import React from 'react';
import Sidebar from '../components/Sidebar';

export default function CoursesPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Browse Courses</h1>
          </div>
          <button className="btn btn-primary">+ New Course</button>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Course listing will populate here from the API.
        </p>
      </main>
    </div>
  );
}
