const { jsPDF } = require('jspdf');

// Certificate template generator (server-side, no DOM required)
class CertificateGenerator {
  constructor() {
    this.width = 1200;
    this.height = 850;
  }

  // Generate certificate as PNG buffer (server-side)
  async generatePNG(certificateData) {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [this.width, this.height]
    });

    // Set background
    pdf.setFillColor(248, 249, 250);
    pdf.rect(0, 0, this.width, this.height, 'F');

    // Add border
    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(3);
    pdf.rect(20, 20, this.width - 40, this.height - 40);

    // Inner border
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(2);
    pdf.rect(25, 25, this.width - 50, this.height - 50);

    // Title
    pdf.setFontSize(48);
    pdf.setTextColor(30, 64, 175);
    pdf.text('Certificate of Completion', this.width / 2, 80, { align: 'center' });

    // Student name
    pdf.setFontSize(32);
    pdf.setTextColor(51, 51, 51);
    pdf.text(certificateData.studentName, this.width / 2, 200, { align: 'center' });

    // Course title
    pdf.setFontSize(24);
    pdf.text(`Course: ${certificateData.courseTitle}`, this.width / 2, 250, { align: 'center' });

    // Category and duration
    pdf.setFontSize(18);
    pdf.text(`${certificateData.courseCategory} • ${certificateData.duration}`, this.width / 2, 290, { align: 'center' });

    // Completion date
    pdf.setFontSize(16);
    pdf.text(`Completed on: ${certificateData.completionDate}`, this.width / 2, 330, { align: 'center' });

    // Certificate ID
    pdf.setFontSize(14);
    pdf.text(`Certificate ID: ${certificateData.certificateId}`, this.width / 2, 380, { align: 'center' });

    // Signature lines
    pdf.setDrawColor(102, 102, 102);
    pdf.setLineWidth(1);
    pdf.line(100, 450, 500, 450);
    pdf.line(600, 450, 1000, 450);

    // Instructor signature
    pdf.setFontSize(16);
    pdf.setTextColor(102, 102, 102);
    pdf.text('Instructor:', 100, 480);
    pdf.text(certificateData.instructorName, 100, 500);

    // Director signature
    pdf.text('Director:', 600, 480);
    pdf.text('_________________', 600, 500);

    return Buffer.from(pdf.output('arraybuffer'));
  }

  // Generate certificate as JPG buffer
  async generateJPG(certificateData) {
    const pngBuffer = await this.generatePNG(certificateData);
    return pngBuffer; // Convert PNG to JPG if needed
  }

  // Generate certificate as PDF
  async generatePDF(certificateData) {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [this.width, this.height]
    });

    // Set background
    pdf.setFillColor(248, 249, 250);
    pdf.rect(0, 0, this.width, this.height, 'F');

    // Add border
    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(3);
    pdf.rect(20, 20, this.width - 40, this.height - 40);

    // Inner border
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(2);
    pdf.rect(25, 25, this.width - 50, this.height - 50);

    // Title
    pdf.setFontSize(48);
    pdf.setTextColor(30, 64, 175);
    pdf.text('Certificate of Completion', this.width / 2, 80, { align: 'center' });

    // Student name
    pdf.setFontSize(32);
    pdf.setTextColor(51, 51, 51);
    pdf.text(certificateData.studentName, this.width / 2, 200, { align: 'center' });

    // Course title
    pdf.setFontSize(24);
    pdf.text(`Course: ${certificateData.courseTitle}`, this.width / 2, 250, { align: 'center' });

    // Category and duration
    pdf.setFontSize(18);
    pdf.text(`${certificateData.courseCategory} • ${certificateData.duration}`, this.width / 2, 290, { align: 'center' });

    // Completion date
    pdf.setFontSize(16);
    pdf.text(`Completed on: ${certificateData.completionDate}`, this.width / 2, 330, { align: 'center' });

    // Certificate ID
    pdf.setFontSize(14);
    pdf.text(`Certificate ID: ${certificateData.certificateId}`, this.width / 2, 380, { align: 'center' });

    // Signature lines
    pdf.setDrawColor(102, 102, 102);
    pdf.setLineWidth(1);
    pdf.line(100, 450, 500, 450);
    pdf.line(600, 450, 1000, 450);

    // Instructor signature
    pdf.setFontSize(16);
    pdf.setTextColor(102, 102, 102);
    pdf.text('Instructor:', 100, 480);
    pdf.text(certificateData.instructorName, 100, 500);

    // Director signature
    pdf.text('Director:', 600, 480);
    pdf.text('_________________', 600, 500);

    return Buffer.from(pdf.output('arraybuffer'));
  }
}

module.exports = CertificateGenerator;
