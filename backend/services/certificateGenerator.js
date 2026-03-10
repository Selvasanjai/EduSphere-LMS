const { createCanvas, loadImage } = require('canvas');
const { jsPDF } = require('jspdf');

// Certificate template generator
class CertificateGenerator {
  constructor() {
    this.width = 1200;
    this.height = 850;
  }

  // Generate certificate as PNG buffer
  async generatePNG(certificateData) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    // Border
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, this.width - 80, this.height - 80);

    // Inner border
    ctx.strokeStyle = '#dbeafe';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, this.width - 100, this.height - 100);

    // Title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', this.width / 2, 150);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Arial';
    ctx.fillText('This is to certify that', this.width / 2, 220);

    // Student Name
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(certificateData.studentName, this.width / 2, 300);

    // Course Title
    ctx.fillStyle = '#475569';
    ctx.font = '32px Arial';
    ctx.fillText('has successfully completed the course', this.width / 2, 380);

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(certificateData.courseTitle, this.width / 2, 450);

    // Course details
    ctx.fillStyle = '#64748b';
    ctx.font = '20px Arial';
    ctx.fillText(`Category: ${certificateData.courseCategory}`, this.width / 2, 520);
    ctx.fillText(`Duration: ${certificateData.duration}`, this.width / 2, 550);

    // Date
    ctx.fillStyle = '#475569';
    ctx.font = '18px Arial';
    ctx.fillText(`Completed on: ${new Date(certificateData.completionDate).toLocaleDateString()}`, this.width / 2, 620);

    // Signatures
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    
    // Left signature
    ctx.beginPath();
    ctx.moveTo(300, 700);
    ctx.lineTo(500, 700);
    ctx.stroke();
    
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.fillText('Instructor Signature', 400, 730);

    // Right signature
    ctx.beginPath();
    ctx.moveTo(700, 700);
    ctx.lineTo(900, 700);
    ctx.stroke();
    
    ctx.fillText('Director Signature', 800, 730);

    // Certificate ID
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Arial';
    ctx.fillText(`Certificate ID: ${certificateData.certificateId}`, this.width / 2, 800);

    // Convert to PNG buffer
    return canvas.toBuffer('image/png');
  }

  // Generate certificate as JPG buffer
  async generateJPG(certificateData) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Same design as PNG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, this.width - 80, this.height - 80);

    ctx.strokeStyle = '#dbeafe';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, this.width - 100, this.height - 100);

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', this.width / 2, 150);

    ctx.fillStyle = '#64748b';
    ctx.font = '24px Arial';
    ctx.fillText('This is to certify that', this.width / 2, 220);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(certificateData.studentName, this.width / 2, 300);

    ctx.fillStyle = '#475569';
    ctx.font = '32px Arial';
    ctx.fillText('has successfully completed the course', this.width / 2, 380);

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(certificateData.courseTitle, this.width / 2, 450);

    ctx.fillStyle = '#64748b';
    ctx.font = '20px Arial';
    ctx.fillText(`Category: ${certificateData.courseCategory}`, this.width / 2, 520);
    ctx.fillText(`Duration: ${certificateData.duration}`, this.width / 2, 550);

    ctx.fillStyle = '#475569';
    ctx.font = '18px Arial';
    ctx.fillText(`Completed on: ${new Date(certificateData.completionDate).toLocaleDateString()}`, this.width / 2, 620);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(300, 700);
    ctx.lineTo(500, 700);
    ctx.stroke();
    
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.fillText('Instructor Signature', 400, 730);

    ctx.beginPath();
    ctx.moveTo(700, 700);
    ctx.lineTo(900, 700);
    ctx.stroke();
    
    ctx.fillText('Director Signature', 800, 730);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Arial';
    ctx.fillText(`Certificate ID: ${certificateData.certificateId}`, this.width / 2, 800);

    // Convert to JPG buffer
    return canvas.toBuffer('image/jpeg');
  }

  // Generate certificate as PDF buffer
  async generatePDF(certificateData) {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 297, 210, 'F');

    // Border
    pdf.setDrawColor(37, 99, 235);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, 277, 190);

    // Inner border
    pdf.setDrawColor(219, 234, 254);
    pdf.setLineWidth(0.2);
    pdf.rect(12, 12, 273, 186);

    // Title
    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Certificate of Completion', 148.5, 40, { align: 'center' });

    // Subtitle
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This is to certify that', 148.5, 55, { align: 'center' });

    // Student Name
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.studentName, 148.5, 75, { align: 'center' });

    // Course completion text
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('has successfully completed the course', 148.5, 90, { align: 'center' });

    // Course Title
    pdf.setTextColor(30, 64, 175);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificateData.courseTitle, 148.5, 110, { align: 'center' });

    // Course details
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(12);
    pdf.text(`Category: ${certificateData.courseCategory}`, 148.5, 130, { align: 'center' });
    pdf.text(`Duration: ${certificateData.duration}`, 148.5, 140, { align: 'center' });

    // Date
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(11);
    pdf.text(`Completed on: ${new Date(certificateData.completionDate).toLocaleDateString()}`, 148.5, 160, { align: 'center' });

    // Signatures
    pdf.setDrawColor(148, 163, 184);
    pdf.setLineWidth(0.1);
    
    // Left signature
    pdf.line(60, 175, 100, 175);
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(10);
    pdf.text('Instructor Signature', 80, 180, { align: 'center' });

    // Right signature
    pdf.line(197, 175, 237, 175);
    pdf.text('Director Signature', 217, 180, { align: 'center' });

    // Certificate ID
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(9);
    pdf.text(`Certificate ID: ${certificateData.certificateId}`, 148.5, 195, { align: 'center' });

    return Buffer.from(pdf.output('arraybuffer'));
  }
}

module.exports = CertificateGenerator;
