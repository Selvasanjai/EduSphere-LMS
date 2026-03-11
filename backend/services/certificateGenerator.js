const { load } = require('html2canvas');
const { jsPDF } = require('jspdf');

// Certificate template generator
class CertificateGenerator {
  constructor() {
    this.width = 1200;
    this.height = 850;
  }

  // Generate certificate as PNG buffer
  async generatePNG(certificateData) {
    // Create certificate HTML
    const certificateHTML = `
      <div style="width: 1200px; height: 850px; background: #f8f9fa; border: 3px solid #1e40af; position: relative; font-family: Arial, sans-serif;">
        <div style="border: 2px solid #3b82f6; margin: 25px; padding: 25px;">
          <h1 style="color: #1e40af; text-align: center; font-size: 48px; margin-bottom: 40px;">Certificate of Completion</h1>
          
          <h2 style="color: #333; text-align: center; font-size: 32px; margin-bottom: 20px;">${certificateData.studentName}</h2>
          
          <p style="text-align: center; font-size: 24px; margin-bottom: 10px;"><strong>Course:</strong> ${certificateData.courseTitle}</p>
          
          <p style="text-align: center; font-size: 18px; margin-bottom: 10px;">${certificateData.courseCategory} • ${certificateData.duration}</p>
          
          <p style="text-align: center; font-size: 16px; margin-bottom: 20px;">Completed on: ${certificateData.completionDate}</p>
          
          <p style="text-align: center; font-size: 14px; margin-bottom: 60px;">Certificate ID: ${certificateData.certificateId}</p>
          
          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div style="text-align: center;">
              <p style="color: #666; font-size: 16px; margin: 0;">Instructor:</p>
              <p style="color: #666; font-size: 16px; margin: 0;">${certificateData.instructorName}</p>
            </div>
            <div style="text-align: center;">
              <p style="color: #666; font-size: 16px; margin: 0;">Director:</p>
              <p style="color: #666; font-size: 16px; margin: 0;">_________________</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Create a temporary DOM element to render HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = certificateHTML;
    tempDiv.style.width = '1200px';
    tempDiv.style.height = '850px';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);
    
    try {
      // Use html2canvas to convert HTML to canvas
      const canvas = await load(tempDiv, {
        useCORS: true,
        allowTaint: true,
        scale: 2
      });
      
      // Remove temporary element
      document.body.removeChild(tempDiv);
      
      return canvas.toBuffer('image/png');
    } catch (error) {
      // Clean up on error
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      throw error;
    }
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
