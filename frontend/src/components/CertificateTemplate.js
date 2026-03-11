import React from 'react';

const CertificateTemplate = ({ certificate, student, course }) => {
  const completionDate = certificate?.approvedAt || certificate?.completionDate || new Date();
  const formattedDate = new Date(completionDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div 
      id="certificate-content"
      style={{
        width: '1000px',
        height: '700px',
        background: '#fff',
        padding: '40px',
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: "'Playfair Display', serif",
        color: '#1a1a1a',
        border: '20px solid #d4af37',
        boxShadow: '0 0 40px rgba(0,0,0,0.1)'
      }}
    >
      {/* Decorative Border */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        bottom: '10px',
        border: '2px solid #d4af37',
        pointerEvents: 'none'
      }} />

      {/* Corners */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '24px', color: '#d4af37' }}>❦</div>
      <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '24px', color: '#d4af37' }}>❦</div>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '24px', color: '#d4af37' }}>❦</div>
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '24px', color: '#d4af37' }}>❦</div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h3 style={{ 
          letterSpacing: '8px', 
          textTransform: 'uppercase', 
          fontSize: '18px', 
          margin: '0 0 20px 0',
          color: '#888'
        }}>
          EDUCERT ACADEMY
        </h3>
        <h1 style={{ 
          fontSize: '64px', 
          margin: '0 0 40px 0', 
          fontStyle: 'italic',
          color: '#d4af37',
          fontWeight: 'normal'
        }}>
          Certificate of Completion
        </h1>
        
        <p style={{ fontSize: '18px', fontStyle: 'italic', margin: '0 0 30px 0' }}>
          This certificate is proudly presented to
        </p>
        
        <h2 style={{ 
          fontSize: '54px', 
          margin: '0 0 20px 0', 
          borderBottom: '2px solid #eee',
          display: 'inline-block',
          paddingBottom: '10px',
          minWidth: '400px'
        }}>
          {student?.name || 'Student Name'}
        </h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.6', maxWidth: '800px', margin: '20px auto' }}>
          has successfully completed all required coursework and assessments of the course
        </p>
        
        <h3 style={{ 
          fontSize: '28px', 
          margin: '20px 0', 
          fontStyle: 'italic',
          color: '#333'
        }}>
          " {course?.title || 'Course Title'} "
        </h3>
        
        <p style={{ 
          fontSize: '16px', 
          margin: '30px 0',
          color: '#666',
          fontStyle: 'italic'
        }}>
          {certificate?.distinctionStatus ? `${certificate.distinctionStatus} • ` : ''} 
          Final Score: {certificate?.finalScore || 0}% • 
          Grade: {certificate?.grade || 'N/A'} • 
          Duration: {certificate?.duration || '12 Weeks (120 Hours)'}
        </p>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '60px',
          padding: '0 60px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>Instructor</p>
            <div style={{ margin: '15px 0', borderBottom: '1px solid #ccc', minWidth: '200px', height: '30px' }}>
               <span style={{ fontStyle: 'italic', fontSize: '18px' }}>Ms. Priya Sharma</span>
            </div>
            <p style={{ margin: '0', fontSize: '13px', color: '#555' }}>Course Instructor</p>
          </div>

          {/* Seal */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: '#d4af37', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontSize: '32px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            border: '4px double #fff'
          }}>
            ✓
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>Date of Issue</p>
            <div style={{ margin: '15px 0', borderBottom: '1px solid #ccc', minWidth: '200px', height: '30px' }}>
              <span style={{ fontSize: '18px' }}>{formattedDate}</span>
            </div>
            <p style={{ margin: '0', fontSize: '13px', color: '#555' }}>Completion Date</p>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{ 
          position: 'absolute', 
          bottom: '40px', 
          left: '0', 
          right: '0', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          fontSize: '11px',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <span>ID: {certificate?.certificateId || 'CERT-XXXXX'}</span>
          <span>•</span>
          <span>Verify at: educert.academy/verify</span>
          <span>•</span>
          <span>Issued by EduCert Academy</span>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
