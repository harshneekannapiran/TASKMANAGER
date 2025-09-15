import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate and download a PDF report from the daily report data
 * @param {Object} reportData - The report data object
 * @param {Date} selectedDate - The selected date for the report
 * @param {string} userName - The user's name
 */
export const generatePDFReport = async (reportData, selectedDate, userName) => {
  try {
    // Create a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set up colors
    const primaryColor = '#3B82F6'; // Blue
    const secondaryColor = '#6B7280'; // Gray
    const successColor = '#10B981'; // Green
    const warningColor = '#F59E0B'; // Yellow
    const dangerColor = '#EF4444'; // Red
    
    // Helper function to add text with styling
    const addText = (text, x, y, options = {}) => {
      pdf.setFontSize(options.fontSize || 12);
      pdf.setTextColor(options.color || '#000000');
      pdf.text(text, x, y);
    };
    
    // Helper function to add a line
    const addLine = (x1, y1, x2, y2, color = '#E5E7EB') => {
      pdf.setDrawColor(color);
      pdf.line(x1, y1, x2, y2);
    };
    
    // Helper function to add a rectangle
    const addRect = (x, y, width, height, fillColor = null, strokeColor = '#E5E7EB') => {
      if (fillColor) {
        pdf.setFillColor(fillColor);
        pdf.rect(x, y, width, height, 'F');
      }
      pdf.setDrawColor(strokeColor);
      pdf.rect(x, y, width, height);
    };
    
    // Header
    pdf.setFillColor(primaryColor);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    addText('TRILO - Daily Productivity Report', 15, 20, {
      fontSize: 20,
      color: '#FFFFFF'
    });
    
    addText(`Generated on: ${new Date().toLocaleDateString()}`, 15, 25, {
      fontSize: 10,
      color: '#FFFFFF'
    });
    
    // User and Date Info
    let yPosition = 45;
    addText(`User: ${userName}`, 15, yPosition, { fontSize: 14, color: primaryColor });
    yPosition += 8;
    addText(`Report Date: ${selectedDate.toLocaleDateString()}`, 15, yPosition, { fontSize: 12 });
    yPosition += 15;
    
    // Add a line separator
    addLine(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;
    
    // Summary Statistics
    addText('Summary Statistics', 15, yPosition, { fontSize: 16, color: primaryColor });
    yPosition += 10;
    
    // Create statistics cards
    const cardWidth = (pageWidth - 45) / 4; // 4 cards with margins
    const cardHeight = 25;
    const cardSpacing = 5;
    
    // Total Tasks Card
    addRect(15, yPosition, cardWidth, cardHeight, '#F3F4F6');
    addText('Total Tasks', 20, yPosition + 8, { fontSize: 10, color: secondaryColor });
    addText(reportData.totalTasks.toString(), 20, yPosition + 15, { fontSize: 16, color: primaryColor });
    
    // Completed Tasks Card
    addRect(15 + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, '#F0FDF4');
    addText('Completed', 20 + cardWidth + cardSpacing, yPosition + 8, { fontSize: 10, color: secondaryColor });
    addText(reportData.completedTasks.toString(), 20 + cardWidth + cardSpacing, yPosition + 15, { fontSize: 16, color: successColor });
    
    // Pending Tasks Card
    addRect(15 + 2 * (cardWidth + cardSpacing), yPosition, cardWidth, cardHeight, '#FEF3C7');
    addText('Pending', 20 + 2 * (cardWidth + cardSpacing), yPosition + 8, { fontSize: 10, color: secondaryColor });
    addText(reportData.pendingTasks.toString(), 20 + 2 * (cardWidth + cardSpacing), yPosition + 15, { fontSize: 16, color: warningColor });
    
    // Overdue Tasks Card
    addRect(15 + 3 * (cardWidth + cardSpacing), yPosition, cardWidth, cardHeight, '#FEE2E2');
    addText('Overdue', 20 + 3 * (cardWidth + cardSpacing), yPosition + 8, { fontSize: 10, color: secondaryColor });
    addText(reportData.overdueTasks.toString(), 20 + 3 * (cardWidth + cardSpacing), yPosition + 15, { fontSize: 16, color: dangerColor });
    
    yPosition += cardHeight + 20;
    
    // Productivity Metrics
    addText('Productivity Metrics', 15, yPosition, { fontSize: 16, color: primaryColor });
    yPosition += 10;
    
    // Productivity Percentage
    addText(`Productivity Rate: ${reportData.productivity}%`, 15, yPosition, { fontSize: 12 });
    yPosition += 8;
    
    // Average Completion Time
    addText(`Average Completion Time: ${reportData.averageCompletionTime.toFixed(1)} hours`, 15, yPosition, { fontSize: 12 });
    yPosition += 15;
    
    // Add a line separator
    addLine(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;
    
    // Performance Insights
    addText('Performance Insights', 15, yPosition, { fontSize: 16, color: primaryColor });
    yPosition += 10;
    
    // Generate insights based on data
    const insights = generateInsights(reportData);
    insights.forEach(insight => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      addText(`• ${insight}`, 20, yPosition, { fontSize: 11 });
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Footer
    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = pageHeight - 20;
    }
    
    addLine(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 5;
    addText('Generated by TRILO Task Management System', 15, yPosition, { fontSize: 10, color: secondaryColor });
    addText(`Page 1 of ${pdf.internal.getNumberOfPages()}`, pageWidth - 50, yPosition, { fontSize: 10, color: secondaryColor });
    
    // Save the PDF
    const fileName = `TRILO_Daily_Report_${selectedDate.toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

/**
 * Generate insights based on report data
 * @param {Object} reportData - The report data object
 * @returns {Array} Array of insight strings
 */
const generateInsights = (reportData) => {
  const insights = [];
  
  if (reportData.productivity >= 80) {
    insights.push('Excellent productivity! You\'re maintaining a high completion rate.');
  } else if (reportData.productivity >= 60) {
    insights.push('Good productivity level. Consider focusing on task prioritization.');
  } else if (reportData.productivity >= 40) {
    insights.push('Moderate productivity. Try breaking down larger tasks into smaller ones.');
  } else {
    insights.push('Low productivity detected. Consider reviewing your task management approach.');
  }
  
  if (reportData.overdueTasks > 0) {
    insights.push(`You have ${reportData.overdueTasks} overdue task(s). Consider reassessing priorities.`);
  } else {
    insights.push('Great job! No overdue tasks. You\'re staying on top of your deadlines.');
  }
  
  if (reportData.averageCompletionTime > 8) {
    insights.push('Tasks are taking longer than expected. Consider time-blocking techniques.');
  } else if (reportData.averageCompletionTime < 2) {
    insights.push('Tasks are being completed quickly. Great efficiency!');
  }
  
  if (reportData.totalTasks === 0) {
    insights.push('No tasks found for this date. Consider adding tasks to track your progress.');
  }
  
  return insights;
};

/**
 * Generate PDF from HTML element (alternative method)
 * @param {string} elementId - The ID of the HTML element to convert
 * @param {string} fileName - The name of the PDF file
 */
export const generatePDFFromElement = async (elementId, fileName = 'TRILO_Report.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    if (imgHeight > pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -(pageHeight), imgWidth, imgHeight);
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }
    
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF from element:', error);
    throw new Error('Failed to generate PDF from element');
  }
};
