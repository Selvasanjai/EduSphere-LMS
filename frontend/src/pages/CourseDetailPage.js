// CourseDetailPage.js
import React from 'react';
import Sidebar from '../components/Sidebar';
export default function CourseDetailPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1 className="page-title">Course Detail</h1>
      </main>
    </div>
  );
}
